import { Search, X, SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';

export function FilterToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortOrder,
  onSortOrderChange,
  onReset,
  hasActiveFilters,
  totalFiltered,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or customer email..."
            className="w-full pl-9.5 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <ArrowUpDown size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-slate-700 font-medium cursor-pointer appearance-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom row: Filter selectors & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal size={13} />
            Filters:
          </span>

          {/* Status selector */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer outline-hidden ${
              status !== 'ALL'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Priority selector */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer outline-hidden ${
              priority !== 'ALL'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{totalFiltered}</span> matching tickets
        </div>
      </div>
    </div>
  );
}
