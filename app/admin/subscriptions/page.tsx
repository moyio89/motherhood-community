import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export default async function SubscriptionsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Create a service role client for admin operations
  const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // First, get all subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })

    if (subscriptionsError) {
      console.error("Error fetching subscriptions:", subscriptionsError)
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold">إدارة الاشتراكات</h3>
            <p className="text-muted-foreground">عرض وإدارة اشتراكات المستخدمين في المنصة</p>
          </div>
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            حدث خطأ أثناء جلب بيانات الاشتراكات. يرجى المحاولة مرة أخرى لاحقاً.
          </div>
        </div>
      )
    }

    // Get all user profiles in one query for efficiency
    const { data: allUserProfiles, error: userProfilesError } = await supabase
      .from("user_profiles")
      .select("id, username, is_admin")

    if (userProfilesError) {
      console.error("Error fetching user profiles:", userProfilesError)
    }

    // Create a map of user profiles by ID for quick lookup
    const userProfilesMap = new Map()
    if (allUserProfiles) {
      allUserProfiles.forEach((profile) => {
        userProfilesMap.set(profile.id, profile)
      })
    }

    // Fetch auth users for all subscription user IDs
    const userIds = (subscriptions || []).map((sub) => sub.user_id)
    const authUsers = new Map()

    // Process users in batches to avoid hitting API limits
    const batchSize = 10
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (userId) => {
          try {
            const {
              data: { user },
              error,
            } = await serviceClient.auth.admin.getUserById(userId)
            if (!error && user) {
              authUsers.set(userId, user)
            }
          } catch (error) {
            console.error(`Error fetching auth user ${userId}:`, error)
          }
        }),
      )
    }

    // For each subscription, get the user details
    const enhancedSubscriptions = (subscriptions || []).map((subscription) => {
      // Look up the user profile in our map
      const userProfile = userProfilesMap.get(subscription.user_id)
      const authUser = authUsers.get(subscription.user_id)

      // Create a shortened user ID for display purposes
      const shortUserId = subscription.user_id.substring(0, 8)

      if (authUser) {
        return {
          ...subscription,
          user_name: userProfile?.username || `مستخدم ${shortUserId}`,
          user_email: authUser.email || subscription.user_id,
          auth_user: authUser,
        }
      } else if (userProfile) {
        return {
          ...subscription,
          user_name: userProfile.username || `مستخدم ${shortUserId}`,
          user_email: subscription.user_id,
          user_profile: userProfile,
        }
      } else {
        return {
          ...subscription,
          user_name: `مستخدم ${shortUserId}`,
          user_email: subscription.user_id,
        }
      }
    })

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">إدارة الاشتراكات</h3>
          <p className="text-muted-foreground">عرض وإدارة اشتراكات المستخدمين في المنصة</p>
        </div>
        <SubscriptionsManagement subscriptions={enhancedSubscriptions || []} />
      </div>
    )
  } catch (error) {
    console.error("Error in subscriptions page:", error)
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">إدارة الاشتراكات</h3>
          <p className="text-muted-foreground">عرض وإدارة اشتراكات المستخدمين في المنصة</p>
        </div>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.</div>
      </div>
    )
  }
}
