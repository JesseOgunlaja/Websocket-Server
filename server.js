require("dotenv").config();
const fastifySocketIo = require("fastify-socket.io");
const fastifyCors = require("@fastify/cors");
const CryptoJS = require("crypto-js");

function decryptString(value) {
  const decrypted = CryptoJS.AES.decrypt(
    value,
    process.env.ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

module.exports = (fastify, _, done) => {
  const PORT = process.env.PORT || 5000;

  fastify.register(fastifyCors, {
    origin: "*",
  });

  fastify.register(fastifySocketIo, {
    wsEngine: require("eiows").Server,
    cors: {
      origin: "*",
    },
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

  fastify.post("/emit-event", (request, reply) => {
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

  fastify.listen(
    {
      port: PORT,
    },
    () => {
      console.log(`Listening on port ${PORT}`);
    }
  );

  done();
};
