import { TicketService } from '../services/ticket.service.js';
import { sendSuccess } from '../utils/api-response.js';

export class TicketController {
  /**
   * GET /api/tickets
   * Retrieves paginated list of tickets with search, filters, and sorting.
   */
  static async list(req, res, next) {
    try {
      const { tickets, meta } = await TicketService.listTickets(req.query);
      sendSuccess(res, tickets, 200, 'Tickets retrieved successfully', meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tickets/summary/stats
   * Retrieves global ticket counts (Total, Open, In Progress, Resolved).
   */
  static async getSummaryStats(_req, res, next) {
    try {
      const stats = await TicketService.getSummaryStats();
      sendSuccess(res, stats, 200, 'Summary statistics calculated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tickets/:id
   * Retrieves details of a specific ticket.
   */
  static async getById(req, res, next) {
    try {
      const id = String(req.params.id);
      const ticket = await TicketService.getTicketById(id);
      sendSuccess(res, ticket, 200, 'Ticket retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tickets
   * Creates a new support ticket.
   */
  static async create(req, res, next) {
    try {
      const createdTicket = await TicketService.createTicket(req.body);
      sendSuccess(res, createdTicket, 201, 'Ticket created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tickets/:id
   * Updates ticket status and/or priority.
   */
  static async update(req, res, next) {
    try {
      const id = String(req.params.id);
      const updatedTicket = await TicketService.updateTicket(id, req.body);
      sendSuccess(res, updatedTicket, 200, 'Ticket updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
