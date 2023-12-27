const express = require('express');

const { Server } = require('socket.io');

const io = new Server({
    cors: true
});
const app = express();
app.use(express.json());
const emailToSocketMapping = new Map();
const socketMappingToEmail = new Map();

io.on("connection", (socket) => {
    console.log("NEW CONNECTION", socket.id)
    socket.on("join-room", (data) => {
        const { roomId, emailId } = data;
        emailToSocketMapping.set(emailId, roomId);
        socketMappingToEmail.set(socket.id, emailId)
        socket.join(roomId);
        socket.emit("joined-room", { roomId })
        socket.broadcast.to(roomId).emit('user-joined', { emailId })
    });
    socket.on('call-user', ({ emailId, offer }) => {
        socket.to(emailToSocketMapping.get(emailId)).emit('incoming-call', { from: socketMappingToEmail.get(socket.id), offer });
    })
    socket.on('call-accepted', ({ emailId, answer }) => {
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-accepted', { answer })
    })
});

app.listen(8000);
io.listen(8001);    
