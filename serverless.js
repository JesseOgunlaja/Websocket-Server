"use strict";

import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
const app = Fastify();

app.register(import("./server"));

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
