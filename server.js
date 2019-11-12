"use strict";
/** @typedef {import("firebase-admin")} firebase */

const Socket = require("./socket");
const admin = require("firebase-admin");

class Server {
  /**
   * @param {firebase.database} database
   */
  constructor(database) {
    this.database = database;
    this.clients = /** @type {Socket[]} */ ([]);
    this.callbacks = new Map([
      ["connection", [socket => this.clients.push(socket)]],
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
 * @returns Server
 */
function createFromCreds(json, databaseUrl, options) {
  admin.initializeApp({
    credential: admin.credential.cert(json),
    databaseURL: databaseUrl,
    ...(options.uid && {databaseAuthVariableOverride: {uid: options.uid}}),
  });
  const database = admin.database();
  return new Server(database);
}
Server.createFromCreds = createFromCreds;

module.exports = Server;
