import * as dotenv from "dotenv";
dotenv.config();

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

app.register(import("../server/server"), {
  prefix: "/",
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
