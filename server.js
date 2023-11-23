const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
app.use(
  cors({
    origin: [
      "*",
      "http://localhost",
      "http://localhost:8000",
      "https://tasktracker4313.online",
      "https://express-websocket-server.vercel.app",
    ],
  })
);
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      "*",
      "http://localhost",
      "http://localhost:8000",
      "https://tasktracker4313.online",
      "https://express-websocket-server.vercel.app",
    ],
  },
});

const PORT = process.env.PORT || 5000;

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

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
