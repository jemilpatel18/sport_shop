import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { config } from './config';

const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  🚀 SPORTZONE API Server running in [${config.env}]`);
      console.log(`  🌐 URL: http://localhost:${PORT}`);
      console.log(`  📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`  🔗 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`=================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully terminating server...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] MongoDB disconnected and HTTP server terminated cleanly.');
        process.exit(0);
      });

      // Force exit after 10s if hung
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal bootstrap error:', error);
    process.exit(1);
  }
};

startServer();

