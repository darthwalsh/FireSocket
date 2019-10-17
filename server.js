"use strict";
/** @typedef {import("firebase")} firebase */

const Socket = require("./socket");

class Server {
  /**
   * @param {firebase} firebase
   */
  constructor(firebase) {
    this.database = firebase.database();
    this.callbacks = new Map([["connection", []]]);
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
  addEventListener(event, cb) {
    const arr = this.callbacks.get(event);
    if (!arr) {
      throw new Error(`Unsupported event type ${event}`);
    }
    arr.push(cb);
  }
}

module.exports = Server;
