import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CommunityForumLoading() {
  return (
    <div className="container py-8 animate-fadeIn">
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Next Meeting Banner Skeleton */}
        <div className="bg-gradient-to-l from-pink-100 to-purple-100 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-right w-full">
              <Skeleton className="h-6 w-40 mr-auto" />
              <Skeleton className="h-8 w-64 mr-auto" />
              <Skeleton className="h-4 w-32 mr-auto" />
              <Skeleton className="h-4 w-48 mr-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-10 w-24 mt-2 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mr-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mr-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mr-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border-b pb-2 last:border-b-0">
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
            </div>

            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4 flex-row-reverse">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-6 w-64" />
                        </div>
                        <div className="flex items-center gap-2 justify-end mt-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex items-center gap-4 text-sm justify-end">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="flex justify-center items-center gap-2 mt-8">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded" />
              ))}
          </div>
        </main>
      </div>
    </div>
  )
}
