import { z } from 'zod';

export const TicketPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const TicketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']);

/**
 * Validation schema for creating a support ticket.
 * Matches all specifications:
 * - Title: required, max 120 chars.
 * - Description: required.
 * - Customer email: required, valid email format.
 * - Priority: Low, Medium, High (defaults to MEDIUM).
 * - Status: Open, In Progress, Resolved (defaults to OPEN).
 */
export const createTicketSchema = z.object({
  title: z
    .string({
      error: 'Title is required',
    })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string({
      error: 'Description is required',
    })
    .trim()
    .min(1, 'Description cannot be empty'),
  customerEmail: z
    .string({
      error: 'Customer email is required',
    })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  priority: TicketPriorityEnum.default('MEDIUM'),
  status: TicketStatusEnum.default('OPEN'),
});

/**
 * Validation schema for updating a support ticket.
 * Users can update status and priority.
 */
export const updateTicketSchema = z
  .object({
    status: TicketStatusEnum.optional(),
    priority: TicketPriorityEnum.optional(),
  })
  .refine((data) => data.status !== undefined || data.priority !== undefined, {
    message: 'At least one field (status or priority) must be provided for update',
  });

/**
 * Validation schema for querying/listing tickets.
 * Handles search, filter by status & priority, sorting by createdAt, and pagination (default 10).
 */
export const queryTicketsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED']).default('ALL'),
  priority: z.enum(['ALL', 'LOW', 'MEDIUM', 'HIGH']).default('ALL'),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1, 'Page must be greater than or equal to 1').default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * UUID parameter validation schema.
 */
export const ticketIdParamSchema = z.object({
  id: z.string().uuid('Invalid ticket ID format (must be a valid UUID)'),
});
