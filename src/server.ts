import app from './app';
import config from './config';
import prisma from './lib/prisma';
import http from 'http';
import { initSocket } from './socket';

async function main() {
  try {
    await prisma.$connect();
    console.log('🗄️  Database connected successfully');
    
    const server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to connect to database', error);
  }
}

main();

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  prisma.$disconnect();
});
