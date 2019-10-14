"use strict";
/** @typedef {import("firebase")} firebase */

const Socket = require("./socket");

class Client {
  /**
   * @param {string} auth // TODO(auth) should use real firebase auth
   * @param {firebase} firebase
   */
  constructor(auth, firebase) {
    this.auth = auth;
    this.database = firebase.database();
    this.callbacks = new Map([ // events not common with socket
      ["open", []], // TODO fire the open event
    ]);
    this.socket = new Socket(this.database.ref(`server/${this.auth}`), this.database.ref(`user/${this.auth}`));
  }

  /**
    * @param {'open'} event
    * @param {(socket: Socket) => void} cb
    *//**
    * @param {'close'} event
    * @param {(socket: Socket) => void} cb
    *//**
    * @param {'message'} event
    * @param {(socket: Socket) => void} cb
    */
  addEventListener(event, cb) {
    const arr = this.callbacks.get(event);
    if (arr) {
      arr.push(cb);
    } else {
      this.socket.addEventListener(event, cb);
    }
  }
}

module.exports = Client;
