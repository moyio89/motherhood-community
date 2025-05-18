import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const useSession = () => {
  const supabase = createClientComponentClient()
  const session = supabase.auth.getSession()
  return session
}
