import { Skeleton } from '@/components/ui'

export function DashboardLoading() {
  return (
    <div className="flex h-full min-h-screen flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}
