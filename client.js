"use strict";
/** @typedef {import("firebase")} firebase */

const Socket = require("./socket");

class Client {
  /**
   * @param {string} auth // TODO should use real firebase auth
   * @param {firebase} firebase
   */
  constructor(auth, firebase) {
    this.auth = auth;
    this.database = firebase.database();
    this.callbacks = new Map([
      ["open", []],
      ["close", []],
      ["message", []]]);
    setTimeout(() => this.database.ref("user").on("child_added", ss => this.onConnection(ss)));
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
    if (!arr) {
      throw new Error(`Unsupported event type ${event}`);
    }
    arr.push(cb);
  }
}

module.exports = Client;
