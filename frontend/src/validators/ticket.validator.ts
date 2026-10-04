import { z } from 'zod';

export const TicketPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const TicketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']);

/**
 * Frontend Zod validation schema for creating a support ticket.
 * Enforces:
 * - Title: required, max 120 chars.
 * - Description: required.
 * - Customer email: required, valid email format.
 * - Priority: Low, Medium, High.
 * - Status: Open, In Progress, Resolved.
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

export const updateTicketSchema = z
  .object({
    status: TicketStatusEnum.optional(),
    priority: TicketPriorityEnum.optional(),
  })
  .refine((data) => data.status !== undefined || data.priority !== undefined, {
    message: 'At least one field (status or priority) must be updated',
  });

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
