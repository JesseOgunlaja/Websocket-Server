require("dotenv").config();
const fastify = require("fastify")();
const fastifySocketIo = require("fastify-socket.io");
const fastifyCors = require("@fastify/cors");
const CryptoJS = require("crypto-js");

fastify.register(fastifyCors, {
  origin: "*",
});

fastify.register(fastifySocketIo, {
  cors: {
    origin: "*",
  },
});

function decryptString(value) {
  const decrypted = CryptoJS.AES.decrypt(
    value,
    process.env.ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

fastify.post("/emit-event", async (request, reply) => {
  const { id, event, msg, password } = request.body;

  if (!id || !event || !msg || !password) {
    return reply.status(400).send({ message: "Missing values" });
  }

  if (password !== process.env.WEBSOCKET_KEY) {
    return reply.status(401).send({ message: "Invalid password" });
  }

  console.log(id, event, msg);

  fastify.io.to(id).emit(event, msg);

  return reply.status(200).send({ message: "Event emitted successfully" });
});

fastify.ready().then(() => {
  fastify.io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const id = socket.handshake.query.id;
    if (token && decryptString(token) === id) {
      socket.join(id);
      return next();
    }
    return new Error("Unauthorized");
  });
});

const start = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    await fastify.listen({
      port: PORT,
    });
    console.log(`Listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
