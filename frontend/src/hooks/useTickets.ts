import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../api/ticket.api.js';
import {
  ApiSuccessEnvelope,
  Ticket,
  TicketQueryParams,
} from '../types/ticket.js';
import { CreateTicketFormData, UpdateTicketFormData } from '../validators/ticket.validator.js';

export const ticketQueryKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketQueryKeys.all, 'list'] as const,
  list: (params: TicketQueryParams) => [...ticketQueryKeys.lists(), params] as const,
  details: () => [...ticketQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketQueryKeys.details(), id] as const,
  stats: () => [...ticketQueryKeys.all, 'stats'] as const,
};

/**
 * Query hook for paginated, filtered, and sorted tickets list.
 */
export function useTicketsQuery(params: TicketQueryParams) {
  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => ticketApi.getTickets(params),
    placeholderData: (previousData) => previousData, // Keeps previous data during page transitions
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
    mutationFn: (formData: CreateTicketFormData) => ticketApi.createTicket(formData),
    onSuccess: () => {
      // Invalidate both lists and stats to ensure consistent state
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
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTicketFormData }) =>
      ticketApi.updateTicket(id, payload),

    // Optimistically update the cache before the network call completes
    onMutate: async ({ id, payload }) => {
      // Cancel outgoing queries for ticket lists to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ticketQueryKeys.lists() });

      // Snapshot previous queries across cache
      const previousQueries = queryClient.getQueriesData<ApiSuccessEnvelope<Ticket[]>>({
        queryKey: ticketQueryKeys.lists(),
      });

      // Optimistically update every ticket list in cache containing this ticket
      queryClient.setQueriesData<ApiSuccessEnvelope<Ticket[]>>(
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

    // Roll back if mutation errors
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, value] of context.previousQueries) {
          queryClient.setQueryData(key, value);
        }
      }
    },

    // Always refetch to ensure source of truth alignment
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.stats() });
    },
  });
}
