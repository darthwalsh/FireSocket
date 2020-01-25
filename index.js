"use strict";

const FireSocket = require("./firesocket");
const Server = require("./server");

FireSocket["Server"] = Server;

module.exports = FireSocket;
