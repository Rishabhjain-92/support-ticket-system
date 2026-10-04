import request from 'supertest';
import { app } from '../src/app.js';
import { prisma, pool } from '../src/db/prisma.js';

describe('Support Ticket API Test Suite', () => {
  let createdTicketId: string;

  beforeAll(async () => {
    // Ensure test database is accessible
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up created test tickets and close connections
    if (createdTicketId) {
      await prisma.ticket.deleteMany({
        where: { id: createdTicketId },
      });
    }
    await prisma.$disconnect();
    await pool.end();
  });

  describe('1. Input Validation Tests (POST /api/tickets)', () => {
    it('should reject creation when title exceeds 120 characters', async () => {
      const longTitle = 'A'.repeat(121);
      const res = await request(app)
        .post('/api/tickets')
        .send({
          title: longTitle,
          description: 'Valid description text',
          customerEmail: 'user@example.com',
          priority: 'MEDIUM',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(
        res.body.error.details.some(
          (d: { field: string; message: string }) =>
            d.field === 'title' && d.message.includes('cannot exceed 120 characters')
        )
      ).toBe(true);
    });

    it('should reject creation when customerEmail is malformed', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Valid Ticket Title',
          description: 'Valid description text',
          customerEmail: 'not-a-valid-email',
          priority: 'HIGH',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(
        res.body.error.details.some(
          (d: { field: string; message: string }) =>
            d.field === 'customerEmail' && d.message.includes('valid email')
        )
      ).toBe(true);
    });

    it('should reject creation when description is empty or missing', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Valid Title',
          description: '',
          customerEmail: 'valid@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(
        res.body.error.details.some(
          (d: { field: string; message: string }) => d.field === 'description'
        )
      ).toBe(true);
    });

    it('should successfully create a valid ticket and assign defaults', async () => {
      const payload = {
        title: 'Automated Test Ticket - Issue with login',
        description: 'Detailed description for automated verification test.',
        customerEmail: 'qa.engineer@company.com',
        priority: 'HIGH',
      };

      const res = await request(app).post('/api/tickets').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.customerEmail).toBe(payload.customerEmail);
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.status).toBe('OPEN'); // Default status
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');

      createdTicketId = res.body.data.id;
    });
  });

  describe('2. Querying, Filtering, Sorting & Pagination (GET /api/tickets)', () => {
    it('should support pagination with default limit of 10', async () => {
      const res = await request(app).get('/api/tickets?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it('should filter tickets by status and priority simultaneously', async () => {
      const res = await request(app).get('/api/tickets?status=OPEN&priority=HIGH');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const ticket of res.body.data) {
        expect(ticket.status).toBe('OPEN');
        expect(ticket.priority).toBe('HIGH');
      }
    });

    it('should search tickets by text in title or customer email', async () => {
      const res = await request(app).get('/api/tickets?search=qa.engineer');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].customerEmail).toContain('qa.engineer');
    });

    it('should sort tickets by creation date ascending and descending', async () => {
      const resDesc = await request(app).get('/api/tickets?sortBy=createdAt&sortOrder=desc&limit=5');
      const resAsc = await request(app).get('/api/tickets?sortBy=createdAt&sortOrder=asc&limit=5');

      expect(resDesc.status).toBe(200);
      expect(resAsc.status).toBe(200);

      const descDates = resDesc.body.data.map((t: { createdAt: string }) => new Date(t.createdAt).getTime());
      const ascDates = resAsc.body.data.map((t: { createdAt: string }) => new Date(t.createdAt).getTime());

      // Verify descending order
      for (let i = 1; i < descDates.length; i++) {
        expect(descDates[i - 1]).toBeGreaterThanOrEqual(descDates[i]);
      }

      // Verify ascending order
      for (let i = 1; i < ascDates.length; i++) {
        expect(ascDates[i - 1]).toBeLessThanOrEqual(ascDates[i]);
      }
    });
  });

  describe('3. Ticket Detail & Status/Priority Updates (GET & PATCH /api/tickets/:id)', () => {
    it('should retrieve complete details of an existing ticket', async () => {
      const res = await request(app).get(`/api/tickets/${createdTicketId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdTicketId);
    });

    it('should update status and priority and persist changes', async () => {
      const updatePayload = {
        status: 'RESOLVED',
        priority: 'LOW',
      };

      const patchRes = await request(app)
        .patch(`/api/tickets/${createdTicketId}`)
        .send(updatePayload);

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.status).toBe('RESOLVED');
      expect(patchRes.body.data.priority).toBe('LOW');

      // Fetch again to verify true persistence
      const fetchRes = await request(app).get(`/api/tickets/${createdTicketId}`);
      expect(fetchRes.body.data.status).toBe('RESOLVED');
      expect(fetchRes.body.data.priority).toBe('LOW');
    });

    it('should return 404 when querying or updating non-existent ticket UUID', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/tickets/${nonExistentUuid}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('4. Global Summary Statistics (GET /api/tickets/summary/stats)', () => {
    it('should calculate global totals reflecting entire dataset', async () => {
      const res = await request(app).get('/api/tickets/summary/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('open');
      expect(res.body.data).toHaveProperty('inProgress');
      expect(res.body.data).toHaveProperty('resolved');

      const { total, open, inProgress, resolved } = res.body.data;
      expect(open + inProgress + resolved).toBe(total);
    });
  });
});
