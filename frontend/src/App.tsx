import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header.js';
import { SummaryCards } from './components/SummaryCards.js';
import { FilterToolbar } from './components/FilterToolbar.js';
import { TicketTable } from './components/TicketTable.js';
import { Pagination } from './components/Pagination.js';
import { CreateTicketModal } from './components/CreateTicketModal.js';
import { TicketDetailModal } from './components/TicketDetailModal.js';
import { SummarySkeleton, TableSkeleton } from './components/SkeletonLoader.js';
import { EmptyState } from './components/EmptyState.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { useTicketsQuery, useSummaryStatsQuery } from './hooks/useTickets.js';
import { useDebounce } from './hooks/useDebounce.js';
import { Ticket, TicketPriority, TicketStatus } from './types/ticket.js';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Dashboard() {
  // Query parameters state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Reset page to 1 whenever any filter changes
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  const handleStatusChange = (status: TicketStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePriorityChange = (priority: TicketPriority | 'ALL') => {
    setPriorityFilter(priority);
    setPage(1);
  };

  const handleSortOrderChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  // React Query queries
  const {
    data: ticketsResponse,
    isLoading: isLoadingTickets,
    isError: isTicketsError,
    error: ticketsError,
    refetch: refetchTickets,
  } = useTicketsQuery({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter,
    priority: priorityFilter,
    sortBy: 'createdAt',
    sortOrder,
    page,
    limit: 10,
  });

  const {
    data: summaryStats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useSummaryStatsQuery();

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const tickets = ticketsResponse?.data || [];
  const meta = ticketsResponse?.meta;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Section 1: Global Summary Counts (Independent of active filters) */}
        <section aria-label="Global ticket statistics">
          {isLoadingStats ? (
            <SummarySkeleton />
          ) : isStatsError || !summaryStats ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <span>Could not load summary statistics from database.</span>
              <button
                onClick={() => refetchStats()}
                className="underline hover:text-amber-950 font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <SummaryCards
              stats={summaryStats}
              activeStatusFilter={statusFilter}
              onSelectStatus={handleStatusChange}
            />
          )}
        </section>

        {/* Section 2: Search, Filters & Sort Controls */}
        <section aria-label="Ticket filters">
          <FilterToolbar
            search={searchInput}
            onSearchChange={handleSearchChange}
            status={statusFilter}
            onStatusChange={handleStatusChange}
            priority={priorityFilter}
            onPriorityChange={handlePriorityChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalFiltered={meta?.total ?? 0}
          />
        </section>

        {/* Section 3: Tickets Table / Cards View */}
        <section aria-label="Ticket listings">
          {isLoadingTickets ? (
            <TableSkeleton />
          ) : isTicketsError ? (
            <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Failed to load support tickets
              </h3>
              <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                {(ticketsError as any)?.message ||
                  'The server encountered an error while querying tickets.'}
              </p>
              <button
                onClick={() => refetchTickets()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              onCreateTicket={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              <TicketTable tickets={tickets} onSelectTicket={handleSelectTicket} />

              {/* Section 4: Backend-driven Pagination Controls */}
              {meta && <Pagination meta={meta} onPageChange={(newPage) => setPage(newPage)} />}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
