require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const CryptoJS = require("crypto-js");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

const PORT = process.env.PORT || 5000;

function decryptString(value) {
  const decrypted = CryptoJS.AES.decrypt(
    value,
    process.env.ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

app.post("/emit-event", (req, res) => {
  const { id, event, msg, password } = req.body;

  if (!id || !event || !msg || !password) {
    return res.status(400).json({ message: "Missing values" });
  }

  if (password !== process.env.WEBSOCKET_KEY) {
    return res.status(401).json({ message: "Invalid password" });
  }

  console.log(id, event, msg);

  io.to(id).emit(event, msg);

  return res.status(200).json({ message: "Event emitted successfully" });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const id = socket.handshake.query.id;
  if (token && decryptString(token) === id) {
    socket.join(id);
    return next();
  }
  return new Response("Unauthorised");
});

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
