"use strict";

/** @typedef {import("firebase")} firebase */

class Socket {
  /**
   * @param {firebase.database.Reference} read
   * @param {firebase.database.Reference} write
   */
  constructor(read, write) {
    this.write = write;
    this.callbacks = new Map([["message", []]]);
    setTimeout(() => read.on("child_added", ss => this.onMessage(ss)));
  }

  /**
   * @param {firebase.database.DataSnapshot} snapshot
   */
  onMessage(snapshot) {
    const data = snapshot.val();
    this.callbacks.get("message").forEach(cb => cb({data}));
  }

  /**
   * @param {any} data of JSON-serializable values
   */
  send(data) {
    this.write.push().set(data);
  }

  /**
    * @param {'message'} event
    * @param {({data: any}) => void} cb
    */
  addEventListener(event, cb) {
    const arr = this.callbacks.get(event);
    if (!arr) {
      throw new Error(`Unsupported event type ${event}`);
    }
    arr.push(cb);
  }
}

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
    const socket = new Socket(this.database.ref(`user/${snapshot.key}`), this.database.ref(`sever/${snapshot.key}`));
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
