import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/emit-event", (request, reply) => {
  const { id, event, msg, password } = request.body;

  if (!id || !event || !msg || !password) {
    return reply.status(400).send({ message: "Missing values" });
  }

  if (password !== process.env.WEBSOCKET_KEY) {
    return reply.status(401).send({ message: "Invalid password" });
  }

  console.log(id, event, msg);

  // fastify.io.to(id).emit(event, msg);

  return reply.status(200).send({ message: "Event emitted successfully" });
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
