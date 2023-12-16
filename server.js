require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const CryptoJS = require("crypto-js");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: process.env.PORT
      ? "https://realtime-nextjs-chat-app.vercel.app"
      : "http://localhost:3000",
  },
});

const PORT = process.env.PORT || 5000;

function decryptString(nameGiven) {
  const decrypted = CryptoJS.AES.decrypt(
    nameGiven,
    process.env.ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);
  const parsed = JSON.parse(decrypted);
  return parsed.nameGiven;
}

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on(process.env.WEBSOCKET_KEY, (id, event, msg) => {
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
