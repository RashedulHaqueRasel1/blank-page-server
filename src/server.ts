import app from './app';
import config from './config';
import prisma from './lib/prisma';
import http from 'http';
import { initSocket } from './socket';
import generateOpenAPI from './openapi';

async function main() {
  try {
    // Generate OpenAPI docs
    await generateOpenAPI();

    await prisma.$connect();
    console.log('🗄️  Database connected successfully');
    
    const server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📄 API Reference docs available at /docs`);
    });
  } catch (error) {
    console.error('Failed to connect to database or start server', error);
  }
}

main();

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  prisma.$disconnect();
});
