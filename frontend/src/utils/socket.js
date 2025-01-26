import {Server} from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server ,{
    cors : {
        origin : ["http://localhost:5173"],
    }
})


export function getRecieverSocketId(recieverId){
    return userSocketMap[recieverId]
}

const userSocketMap = {} // {userId : socketId}
// user id will come from data base 
// socket id will come from socket connection

io.on ("connection" , (socket) => {

    console.log("User connected",socket.id)

    const userId = socket.handshake.query.userId;

    if(userId){
        userSocketMap[userId] = socket.id
    }
    //  io.emmit is used to send message to all the connected clients
    io.emit("getOnlineUsers" , Object.keys(userSocketMap));

    socket.on("disconnect" , () => {
        console.log("User disconnected")
        delete userSocketMap[userId];
        io.emit("getOnlineUsers" , Object.keys(userSocketMap));

    })
})

export {io , app , server};