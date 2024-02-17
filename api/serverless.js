import * as dotenv from "dotenv";
dotenv.config();

import CryptoJS from "crypto-js";

function decryptString(value) {
  const decrypted = CryptoJS.AES.decrypt(
    value,
    process.env.ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

import Fastify from "fastify";
import fastifySocketIo from "fastify-socket.io";
import fastifyCors from "@fastify/cors";

const app = Fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin: "*",
});

app.register(fastifySocketIo, {
  cors: {
    origin: "*",
  },
});

app.ready().then(() => {
  app.io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const id = socket.handshake.query.id;
    if (token && decryptString(token) === id) {
      socket.join(id);
      return next();
    }
    return new Error("Unauthorized");
  });
});

app.post("/emit-event", (request, reply) => {
  const { id, event, msg, password } = request.body;

  if (!id || !event || !msg || !password) {
    return reply.status(400).send({ message: "Missing values" });
  }

  if (password !== process.env.WEBSOCKET_KEY) {
    return reply.status(401).send({ message: "Invalid password" });
  }

  console.log(id, event, msg);

  app.io.to(id).emit(event, msg);

  return reply.status(200).send({ message: "Event emitted successfully" });
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
