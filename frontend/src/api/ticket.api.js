import apiClient from './client.js';

export const ticketApi = {
  /**
   * Fetches paginated tickets with search, filters, and sorting.
   */
  async getTickets(params) {
    const response = await apiClient.get('/tickets', {
      params,
    });
    return response.data;
  },

  /**
   * Fetches global summary counts (reflecting the full dataset).
   */
  async getSummaryStats() {
    const response = await apiClient.get('/tickets/summary/stats');
    return response.data.data;
  },

  /**
   * Fetches full ticket details by UUID.
   */
  async getTicketById(id) {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new support ticket.
   */
  async createTicket(payload) {
    const response = await apiClient.post('/tickets', payload);
    return response.data.data;
  },

  /**
   * Updates status and/or priority of a support ticket.
   */
  async updateTicket(id, payload) {
    const response = await apiClient.patch(`/tickets/${id}`, payload);
    return response.data.data;
  },
};
