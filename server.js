const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000",
  },
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("global", (id, event, msg) => {
    console.log(id, event, msg);
    socket.broadcast.emit(id, event, msg);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Listening on port", 5000);
});
