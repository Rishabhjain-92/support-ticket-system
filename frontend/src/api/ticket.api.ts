import apiClient from './client.js';
import {
  ApiSuccessEnvelope,
  SummaryStats,
  Ticket,
  TicketQueryParams,
} from '../types/ticket.js';
import { CreateTicketFormData, UpdateTicketFormData } from '../validators/ticket.validator.js';

export const ticketApi = {
  /**
   * Fetches paginated tickets with search, filters, and sorting.
   */
  async getTickets(params: TicketQueryParams): Promise<ApiSuccessEnvelope<Ticket[]>> {
    const response = await apiClient.get<ApiSuccessEnvelope<Ticket[]>>('/tickets', {
      params,
    });
    return response.data;
  },

  /**
   * Fetches global summary counts (reflecting the full dataset).
   */
  async getSummaryStats(): Promise<SummaryStats> {
    const response = await apiClient.get<ApiSuccessEnvelope<SummaryStats>>('/tickets/summary/stats');
    return response.data.data;
  },

  /**
   * Fetches full ticket details by UUID.
   */
  async getTicketById(id: string): Promise<Ticket> {
    const response = await apiClient.get<ApiSuccessEnvelope<Ticket>>(`/tickets/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new support ticket.
   */
  async createTicket(payload: CreateTicketFormData): Promise<Ticket> {
    const response = await apiClient.post<ApiSuccessEnvelope<Ticket>>('/tickets', payload);
    return response.data.data;
  },

  /**
   * Updates status and/or priority of a support ticket.
   */
  async updateTicket(id: string, payload: UpdateTicketFormData): Promise<Ticket> {
    const response = await apiClient.patch<ApiSuccessEnvelope<Ticket>>(`/tickets/${id}`, payload);
    return response.data.data;
  },
};
