import { app } from './app.js';
import { prisma, pool } from './db/prisma.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Support Ticket API server listening at http://localhost:${PORT}`);
  console.log(`📊 Healthcheck available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling for SIGINT and SIGTERM
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    try {
      await prisma.$disconnect();
      await pool.end();
      console.log('🗄️ Database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force shutdown if cleanup takes too long
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process due to shutdown timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
