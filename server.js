"use strict";

/** @typedef {import("firebase")} firebase */

class Socket {
  /**
   * @param {firebase.database.Database} database
   * @param {string} key
   */
  constructor(database, key) {
    this.database = database;
    this.writeRef = this.database.ref(`user/${key}`);
    const readRef = this.database.ref(`server/${key}`);
    readRef.on("child_added", this.onMessage);
    this.callbacks = new Map([["message", []]]);
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
    this.writeRef.push().set(data);
  }

  /**
    * @param {'message'} event
    * @param {any} cb
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
    this.database.ref("server").on("child_added", this.onConnection);
    this.callbacks = new Map([["connection", []]]);
  }

  /**
   * @param {firebase.database.DataSnapshot} snapshot
   */
  onConnection(snapshot) {
    const socket = new Socket(this.database, snapshot.key);
    this.callbacks.get("connection").forEach(cb => cb(socket));
  }


  /**
  * @param {'connection'} event
  * @param {any} cb
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
