import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const initSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // console.log('New client connected:', socket.id);

    socket.on('join-page', (customUrl: string) => {
      socket.join(customUrl);
      // console.log(`Socket ${socket.id} joined page: ${customUrl}`);
    });

    socket.on('edit-page', (data: { customUrl: string; content: string }) => {
      // Broadcast to all OTHER clients in the room
      socket.to(data.customUrl).emit('page-updated', data.content);
    });

    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
