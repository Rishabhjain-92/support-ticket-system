import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTicketSchema,
  queryTicketsSchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from '../validators/ticket.validator.js';

const router = Router();

/**
 * @route   GET /api/tickets/summary/stats
 * @desc    Get aggregate ticket counts (Total, Open, In Progress, Resolved)
 * @access  Public
 * Note: Must precede /:id to prevent route shadowing
 */
router.get('/summary/stats', TicketController.getSummaryStats);

/**
 * @route   GET /api/tickets
 * @desc    Search, filter, sort, and paginate tickets
 * @access  Public
 */
router.get('/', validate(queryTicketsSchema, 'query'), TicketController.list);

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 * @access  Public
 */
router.post('/', validate(createTicketSchema, 'body'), TicketController.create);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get a single ticket by its UUID
 * @access  Public
 */
router.get('/:id', validate(ticketIdParamSchema, 'params'), TicketController.getById);

/**
 * @route   PATCH /api/tickets/:id
 * @desc    Update a ticket's status and/or priority
 * @access  Public
 */
router.patch(
  '/:id',
  validate(ticketIdParamSchema, 'params'),
  validate(updateTicketSchema, 'body'),
  TicketController.update
);

export default router;
