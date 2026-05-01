import { Server } from "socket.io"
import dotenv from "dotenv";
dotenv.config();

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const connections = {};
    const timeOnline = {};
    const messages = {};

    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED");

        socket.on("join-call", (path) => {
            if(connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            for(let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-connected", socket.id, connections[path]);
            }

            if(messages[path] !== undefined) {
                for(let a = 0; a < messages[path].length; a++) {
                    io.to(socket.id).emit("chat-message", messages[path][a].data,
                        messages[path][a].sender, messages[path][a].socketIdSender
                    );
                }
            }
        });

        socket.on("signal", (toId, message) => {
            console.log("SIGNAL RECEIVED:", toId, message);
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (message, sender) => {
            console.log("🔥 CHAT EVENT RECEIVED");
            console.log("Connections:", connections);
            console.log("Socket ID:", socket.id);

            let matchedRoomKey = "";
            let isFound = false;
            for(let [roomKey, roomValue] of Object.entries(connections)) {
                if(!isFound && roomValue.includes(socket.id)) {
                    matchedRoomKey = roomKey;
                    isFound = true;
                    break;
                }
            }
            
            if(isFound === true) {
                if(messages[matchedRoomKey] === undefined) {
                    messages[matchedRoomKey] = [];
                }

                messages[matchedRoomKey].push({data: message, sender: sender, socketIdSender: socket.id});
                for(let a = 0; a < connections[matchedRoomKey].length; a++) {
                    io.to(connections[matchedRoomKey][a]).emit("chat-message", message, sender, socket.id);
                }
            }
        });

        socket.on("disconnect", () => {
            let matchedRoomkey = "";
            for(let [roomKey, roomValue] of Object.entries(connections)) {
                if(roomValue.includes(socket.id)) {
                    matchedRoomkey = roomKey;
                    break;
                }
            }

            if(!matchedRoomkey) return;

            for(let a = 0; a < connections[matchedRoomkey].length; a++) {
                if(connections[matchedRoomkey][a] !== socket.id) {
                    io.to(connections[matchedRoomkey][a]).emit("user-left", socket.id);
                }
            }

            let index = connections[matchedRoomkey].indexOf(socket.id);
            if(index !== -1) {
                connections[matchedRoomkey].splice(index, 1);
            }
            if(connections[matchedRoomkey].length === 0) {
                delete connections[matchedRoomkey];
            }
        });

    });

    return io;

}

export default initSocket;