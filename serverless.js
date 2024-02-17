"use strict";

require("dotenv").config();

const app = require("fastify")();

app.register(require("./server"));

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
