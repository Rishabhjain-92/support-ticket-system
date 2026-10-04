import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../api/ticket.api.js';

export const ticketQueryKeys = {
  all: ['tickets'],
  lists: () => [...ticketQueryKeys.all, 'list'],
  list: (params) => [...ticketQueryKeys.lists(), params],
  details: () => [...ticketQueryKeys.all, 'detail'],
  detail: (id) => [...ticketQueryKeys.details(), id],
  stats: () => [...ticketQueryKeys.all, 'stats'],
};

/**
 * Query hook for paginated, filtered, and sorted tickets list.
 */
export function useTicketsQuery(params) {
  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => ticketApi.getTickets(params),
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
  });
}

/**
 * Query hook for global summary stats (total, open, inProgress, resolved).
 */
export function useSummaryStatsQuery() {
  return useQuery({
    queryKey: ticketQueryKeys.stats(),
    queryFn: () => ticketApi.getSummaryStats(),
    staleTime: 15000,
  });
}

/**
 * Mutation hook for creating a support ticket.
 * Automatically invalidates ticket list and summary counts.
 */
export function useCreateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => ticketApi.createTicket(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.stats() });
    },
  });
}

/**
 * Mutation hook for updating ticket status or priority.
 * Implements optimistic updates for instantaneous UI response.
 */
export function useUpdateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => ticketApi.updateTicket(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ticketQueryKeys.lists() });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ticketQueryKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: ticketQueryKeys.lists() },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((ticket) =>
              ticket.id === id ? { ...ticket, ...payload, updatedAt: new Date().toISOString() } : ticket
            ),
          };
        }
      );

      return { previousQueries };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, value] of context.previousQueries) {
          queryClient.setQueryData(key, value);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.stats() });
    },
  });
}
