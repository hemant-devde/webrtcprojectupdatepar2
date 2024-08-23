import express from 'express';
import { createServer } from 'http'; // Use 'createServer' from 'http' for ES module compatibility
import { Server } from 'socket.io';

const app = express();
const server = createServer(app); // Use createServer to create an HTTP server

const io = new Server(server, {
  cors: true
});
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow all origins (adjust this as needed for security)
//     methods: ["GET", "POST"]
//   }
// });

app.get('/', (req, res)=>{
    res.send({massage : "server running"})
})

const userMapping = new Map();

app.use(express.json());

// io.on('connection', (socket) => {
//   console.log('New connection ');

//   socket.on('join-room', (data) => {
//     const { roomID, user } = data;
//     console.log('requesting for joining room', data);

//     console.log(`user ${user} joined room ${roomID}`);
//     userMapping.set(socket.id, { user, roomID });
//     console.log('userMapping :', userMapping);

//     socket.join(roomID);
//     console.log('added');

//     socket.emit('joined-room', { roomID ,user });
//     socket.broadcast.to(roomID).emit('user-joined', { userName });
//   });

//   socket.on('call-user', (data) => {
//     try {
//       const { roomID, offer } = data;
//       const fromUserName = userMapping.get(socket.id).userName;

//       console.log('existing user calling  users in room:', roomID);
//       console.log('Offer:', offer);

//       socket.to(roomID).emit('incoming-call', { from: fromUserName, offer });
//     } catch (error) {
//       console.error('Error in call-user event:', error.message);
//       socket.emit('error', { message: 'Failed to initiate call' });
//     }
//   });

//   socket.on('call-accepted', (data) => {
//     const { roomID, answer } = data;

//     console.log('Call accepted in room:', roomID);
//     console.log('Answer:', answer);

//     socket.to(roomID).emit('call-accepted', { answer });
//   });

//   socket.on('ice-candidate', (data) => {
//     const { roomID, candidate } = data;

//     console.log('ICE candidate in room:', roomID);
//     console.log('Candidate:', candidate);

//     socket.to(roomID).emit('ice-candidate', { candidate });
//   });

//   socket.on('disconnect', () => {
//     const userName = userMapping.get(socket.id).userName;
//     const roomID = userMapping.get(socket.id).roomID;

//     console.log(`user ${userName} left room ${roomID}`);
//     userMapping.delete(socket.id);

//     socket.broadcast.to(roomID).emit('user-left', { userName });
//   });
// });

io.on('connection', (socket) => {
  console.log('New connection ');

  socket.on('join-room', (data) => {
    const { roomID, user } = data;
    console.log('requesting for joining room', data);

    console.log(`user ${user} joined room ${roomID}`);
    userMapping.set(socket.id, { user, roomID });
    console.log('userMapping :', userMapping);

    socket.join(roomID);
    console.log('added');

    socket.emit('joined-room', { roomID, user });
    socket.broadcast.to(roomID).emit('user-joined', { user, roomID });
  });

  socket.on('call-user', (data) => {
    try {
      const { roomID, offer } = data;
      const fromUser = userMapping.get(socket.id).user;

      console.log('existing user calling users in room:', roomID);
      console.log('Offer:', offer);

      socket.to(roomID).emit('incoming-call', { from: fromUser, offer });
    } catch (error) {
      console.error('Error in call-user event:', error.message);
      socket.emit('error', { message: 'Failed to initiate call' });
    }
  });

  socket.on('call-accepted', (data) => {
    const { roomID, answer, to } = data;

    console.log('Call accepted in room:', roomID);
    console.log('Answer:', answer);

    socket.to(roomID).emit('call-accepted', { answer, user: to });
  });

  socket.on('ice-candidate', (data) => {
    const { roomID, candidate, to } = data;

    console.log('ICE candidate in room:', roomID);
    console.log('Candidate:', candidate);

    socket.to(roomID).emit('ice-candidate', { candidate, from: userMapping.get(socket.id).user });
  });

  socket.on('disconnect', () => {
    const userData = userMapping.get(socket.id);
    if (userData) {
      const { user, roomID } = userData;
      console.log(`user ${user} left room ${roomID}`);
      userMapping.delete(socket.id);
      socket.broadcast.to(roomID).emit('user-left', { user });
    }
  });
});

server.listen(8000, () => console.log(`Backend server running on port 8000`));