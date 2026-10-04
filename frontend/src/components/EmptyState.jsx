import { SearchX, RotateCcw } from 'lucide-react';

export function EmptyState({ hasFilters, onResetFilters, onCreateTicket }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <SearchX size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">No tickets found</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
        {hasFilters
          ? "We couldn't find any tickets matching your current search or filter criteria."
          : 'There are currently no tickets in the system. Create one to get started.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {hasFilters ? (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
            Reset all filters
          </button>
        ) : onCreateTicket ? (
          <button
            onClick={onCreateTicket}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Create first ticket
          </button>
        ) : null}
      </div>
    </div>
  );
}
