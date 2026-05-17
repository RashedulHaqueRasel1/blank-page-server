import app from './app';
import config from './config';
import prisma from './lib/prisma';


async function main() {
  try {
    await prisma.$connect();
    console.log('🗄️  Database connected successfully');
    
    app.listen(config.port, () => {
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
