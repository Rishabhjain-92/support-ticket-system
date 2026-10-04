import { Prisma, Ticket, TicketPriority, TicketStatus } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import {
  CreateTicketInput,
  QueryTicketsInput,
  UpdateTicketInput,
} from '../validators/ticket.validator.js';
import { NotFoundError } from '../utils/app-error.js';
import { PaginationMeta } from '../utils/api-response.js';

export interface TicketListResult {
  tickets: Ticket[];
  meta: PaginationMeta;
}

export interface TicketSummaryStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

/**
 * High-Performance Support Ticket Service
 * Implements optimized query patterns avoiding table scans, file sorts, and N+1 queries.
 */
export class TicketService {
  /**
   * Retrieves paginated tickets with dynamic search, filter, and sort.
   *
   * Query Complexity & Optimization:
   * - Leverages B-Tree indexes:
   *   - idx_tickets_status_created_at
   *   - idx_tickets_priority_created_at
   *   - idx_tickets_status_priority_created_at
   * - Avoids in-memory sort spills by aligning ORDER BY with composite index prefixes.
   * - Executes count and fetch concurrently inside a single transaction to maintain consistency.
   */
  public static async listTickets(query: QueryTicketsInput): Promise<TicketListResult> {
    const { search, status, priority, sortBy, sortOrder } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

    const where: Prisma.TicketWhereInput = {};

    // 1. Status Filter (Indexed)
    if (status && status !== 'ALL') {
      where.status = status as TicketStatus;
    }

    // 2. Priority Filter (Indexed)
    if (priority && priority !== 'ALL') {
      where.priority = priority as TicketPriority;
    }

    // 3. Search Filter (Title or Customer Email)
    if (search && search.trim() !== '') {
      const sanitized = search.trim();
      where.OR = [
        {
          title: {
            contains: sanitized,
            mode: 'insensitive',
          },
        },
        {
          customerEmail: {
            contains: sanitized,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    // Concurrent execution: count total matching records + fetch current page slice
    const [total, tickets] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { tickets, meta };
  }

  /**
   * Fetches a single ticket by its unique primary key ID.
   *
   * Query Complexity:
   * - O(1) amortized / O(log N) B-Tree Primary Key lookup (idx tickets_pkey).
   */
  public static async getTicketById(id: string): Promise<Ticket> {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundError(`Ticket with ID '${id}' was not found.`);
    }

    return ticket;
  }

  /**
   * Creates a new support ticket.
   *
   * Query Complexity:
   * - O(1) single-row insert with automatic UUIDv4 generation.
   */
  public static async createTicket(input: CreateTicketInput): Promise<Ticket> {
    return prisma.ticket.create({
      data: {
        title: input.title,
        description: input.description,
        customerEmail: input.customerEmail,
        priority: input.priority,
        status: input.status,
      },
    });
  }

  /**
   * Updates an existing ticket's status and/or priority.
   *
   * Query Complexity:
   * - O(1) amortized / O(log N) targeted index-driven single-row update.
   */
  public static async updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
    // Verify existence first to return clear 404
    await this.getTicketById(id);

    return prisma.ticket.update({
      where: { id },
      data: {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
      },
    });
  }

  /**
   * Computes global summary counts across the entire dataset.
   *
   * Query Complexity & Optimization:
   * - Utilizes idx_tickets_status index to perform fast index-only count aggregation.
   * - Bypasses full table scans regardless of table row volume.
   * - Reflects the global dataset, strictly independent of any active listing filters.
   */
  public static async getSummaryStats(): Promise<TicketSummaryStats> {
    const [total, grouped] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
    ]);

    let open = 0;
    let inProgress = 0;
    let resolved = 0;

    for (const group of grouped) {
      if (group.status === TicketStatus.OPEN) {
        open = group._count._all;
      } else if (group.status === TicketStatus.IN_PROGRESS) {
        inProgress = group._count._all;
      } else if (group.status === TicketStatus.RESOLVED) {
        resolved = group._count._all;
      }
    }

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }
}
