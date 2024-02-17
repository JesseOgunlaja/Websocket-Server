import * as dotenv from "dotenv";
dotenv.config();

// import CryptoJS from "crypto-js";

// function decryptString(value) {
//   const decrypted = CryptoJS.AES.decrypt(
//     value,
//     process.env.ENCRYPTION_KEY
//   ).toString(CryptoJS.enc.Utf8);
//   return decrypted;
// }

export default async function (fastify, _, done) {
  // fastify.ready().then(() => {
  //   fastify.io.use((socket, next) => {

  //     const token = socket.handshake.auth.token;
  //     const id = socket.handshake.query.id;
  //     if (token && decryptString(token) === id) {
  //       socket.join(id);
  //       return next();
  //     }
  //     return new Error("Unauthorized");
  //   });
  // });

  fastify.get("/emit-event", (request, reply) => {
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

  done();
}
