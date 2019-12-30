"use strict";
/** @typedef {import("firebase-admin")} firebase */
/** @typedef {import("express").Express} Express */

const Socket = require("./socket");

class Server {
  /**
   * @param {firebase.database.Database} database
   */
  constructor(database) {
    this.database = database;
    this.clients = /** @type {Socket[]} */ ([]);
    this.callbacks = new Map([
      ["connection", [socket => {
        this.clients.push(socket);
      }]],
    ]);
    setTimeout(() => this.database.ref("user").on("child_added", ss => this.onConnection(ss)));
  }

  /**
   * @param {firebase.database.DataSnapshot} snapshot
   */
  onConnection(snapshot) {
    const socket = new Socket(this.database.ref(`user/${snapshot.key}`), this.database.ref(`server/${snapshot.key}`));
    this.callbacks.get("connection").forEach(cb => cb(socket));
  }


  /**
  * @param {'connection'} event
  * @param {(socket: Socket) => void} cb
  */
  on(event, cb) {
    const arr = this.callbacks.get(event);
    if (!arr) {
      throw new Error(`Unsupported event type ${event}`);
    }
    arr.push(cb);
  }
}

// TODO test?
/**
 * helper constructor to avoid using firebase directly
 * @param {string} json JSON string with service account credentials
 * @param {string} databaseUrl e.g. "https://databaseName.firebaseio.com"
 * @param {object} options
 * @param {string} [options.uid] custom auth for limited privileges
 * @param {Express} [options.app] Express app to serve firesocket client lib
 * @param {object} [options.config] Firebase client config
 * @returns Server
 */
function createFromCreds(json, databaseUrl, options) {
  if (options.app) {
    options.app.use("/firesocket.js", (_, res) => res.sendFile("build-browser.js", {root: __dirname}));
    options.app.use("/firebase-config.json", (_, res) => res.json(options.config));
  }

  const admin = require("firebase-admin");
  admin.initializeApp({
    credential: admin.credential.cert(json),
    databaseURL: databaseUrl,
    ...(options.uid && {databaseAuthVariableOverride: {uid: options.uid}}),
  });
  return new Server(/** @type {any} */(admin.database()));
}
Server.createFromCreds = createFromCreds;

module.exports = Server;
