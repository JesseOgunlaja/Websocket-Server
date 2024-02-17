import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";

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

app.register(require("../server/server"));

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};