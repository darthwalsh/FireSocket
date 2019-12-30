"use strict";

const FireSocket = require("./firesocket");
const Server = require("./server");

// @ts-ignore
FireSocket.Server = Server;

module.exports = FireSocket;
