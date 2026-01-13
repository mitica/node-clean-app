import { serve } from '@hono/node-server';
import { App } from './api/app';
import { config } from './config';

async function createDataDirectories(): Promise<void> {
  // const fs = await import('fs');
  // const path = await import('path');
  
  // const dataDir = path.dirname(config.database.mainDbPath);
  
  // if (!fs.existsSync(dataDir)) {
  //   fs.mkdirSync(dataDir, { recursive: true });
  //   console.log(`Created data directory: ${dataDir}`);
  // }
}

async function startServer(): Promise<void> {
  try {
    // Create data directories if they don't exist
    await createDataDirectories();
    
    // Initialize the application
    const app = new App();
    await app.initialize();

    // Start the server
    serve({
      fetch: app.getApp().fetch,
      port: config.port,
    });

    console.log(`🚀 Server is running on port ${config.port}`);
    console.log(`📊 Health check: http://localhost:${config.port}/health`);
    console.log(`📋 API endpoint: http://localhost:${config.port}/api/users`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down server...');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
