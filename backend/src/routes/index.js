import { Router } from 'express';
import ticketRoutes from './ticket.routes.js';
import { sendSuccess } from '../utils/api-response.js';

const apiRouter = Router();

// Healthcheck endpoint for container orchestration and uptime monitoring
apiRouter.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy', uptime: process.uptime() }, 200, 'API service is operational');
});

// Support ticket resources
apiRouter.use('/tickets', ticketRoutes);

export default apiRouter;
