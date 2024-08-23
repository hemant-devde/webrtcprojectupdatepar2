// import express from "express";
// // import { socket } from "server/router";
// import { Server } from "socket.io";

// const app = express();
// const io = new Server({
//   cors:true,
// });

// io.on('connection', (socket)=>{


//   console.log("new user ", socket.id);


//   socket.on('join-room', data =>{
//     const {user ,roomID} = data
//     console.log(`${user}  wants to enter the room : ` , roomID);

    
//     socket.join(roomID)
//     socket.emit("joined-room", { roomID })
//     socket.broadcast.to(roomID).emit("user-joined", { user});
//     // socket.to(roomID).broadcast.emit('user-connected' , {data})
//     // socket.emit('user-connected',  )
//   })

//   socket.on('disconnect', socket =>{
//     console.log("Disconnected " , socket.id);
//   })
// })








// app.listen(4000 , ()=>console.log("server started on port 4000"))
// io.listen(4001)