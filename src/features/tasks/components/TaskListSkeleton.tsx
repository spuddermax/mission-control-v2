const skeletonCards = Array.from({ length: 6 })

export function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {skeletonCards.map((_, index) => (
          <div
            key={index}
            className="h-full rounded-xl border border-slate-100/80 bg-white/60 p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="space-y-2 rounded-lg border border-slate-100/60 bg-slate-50/70 p-3">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="h-9 w-28 animate-pulse rounded-full border border-slate-100 bg-white/70" />
      </div>
    </div>
  )
}
