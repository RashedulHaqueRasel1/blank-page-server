"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);
        socket.on('join-page', (customUrl) => {
            socket.join(customUrl);
            console.log(`🔌 Socket ${socket.id} joined page: ${customUrl}`);
        });
        socket.on('edit-page', (data) => {
            // Broadcast to all OTHER clients in the room
            socket.to(data.customUrl).emit('page-updated', data.content);
        });
        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
