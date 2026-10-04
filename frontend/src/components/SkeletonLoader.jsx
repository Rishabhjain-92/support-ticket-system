export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs animate-pulse">
          <div className="h-4 bg-slate-200 rounded-md w-20 mb-3" />
          <div className="h-8 bg-slate-200 rounded-md w-14 mb-2" />
          <div className="h-3 bg-slate-100 rounded-md w-28" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded-md w-36 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded-md w-24 animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded-md w-3/5" />
              <div className="h-3 bg-slate-100 rounded-md w-2/5" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 bg-slate-100 rounded-full w-20" />
              <div className="h-6 bg-slate-100 rounded-full w-16" />
              <div className="h-4 bg-slate-100 rounded-md w-20 hidden md:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
