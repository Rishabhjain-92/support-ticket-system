import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service.js';
import { sendSuccess } from '../utils/api-response.js';
import {
  CreateTicketInput,
  QueryTicketsInput,
  UpdateTicketInput,
} from '../validators/ticket.validator.js';

export class TicketController {
  /**
   * GET /api/tickets
   * Retrieves paginated list of tickets with search, filters, and sorting.
   */
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryTicketsInput;
      const { tickets, meta } = await TicketService.listTickets(query);
      sendSuccess(res, tickets, 200, 'Tickets retrieved successfully', meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tickets/summary/stats
   * Retrieves global ticket counts (Total, Open, In Progress, Resolved).
   */
  public static async getSummaryStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
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
  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
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
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateTicketInput;
      const createdTicket = await TicketService.createTicket(input);
      sendSuccess(res, createdTicket, 201, 'Ticket created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tickets/:id
   * Updates ticket status and/or priority.
   */
  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const input = req.body as UpdateTicketInput;
      const updatedTicket = await TicketService.updateTicket(id, input);
      sendSuccess(res, updatedTicket, 200, 'Ticket updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
