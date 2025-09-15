import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST'],
    },
});

// Map to store userId -> socketId
const userSocketMap = {}; 

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

io.on('connection', (socket) => {
    //console.log('A user connected with socket ID:', socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
       // console.log(`User with ID ${userId} connected`);
    } else {
       // console.warn(`A socket connected without a userId: ${socket.id}`);
    }

    // Emit current online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // --- Handle sending messages ---
    socket.on('send_message', ({ message, to }) => {
  const receiverSocketId = userSocketMap[to];

  // send to receiver
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('receive_message', message);
  }

  //send back to sender
  io.to(socket.id).emit('receive_message', message);
});


    socket.on('disconnect', () => {
        //console.log(`User with ID ${userId} disconnected`);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, io, server };
