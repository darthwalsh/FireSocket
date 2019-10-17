"use strict";
/** @typedef {import("firebase")} firebase */

const Socket = require("./socket");

class FireSocket {
  /**
   * @param {string} auth // TODO(auth) should use real firebase auth
   * @param {firebase} firebase
   */
  constructor(auth, firebase) {
    this.auth = auth;
    this.database = firebase.database();
    this.callbacks = new Map([ // events not in common with socket
      ["open", []],
    ]);
    const write = this.database.ref(`user/${this.auth}`);
    write.update({"__CONNECTION": true}, () => this.callbacks.get("open").forEach(cb => cb()));
    this.socket = new Socket(this.database.ref(`server/${this.auth}`), write);
  }

  /**
    * @param {'open'} event
    * @param {() => void} cb
    *//**
    * @param {'close'} event //TODO
    * @param {() => void} cb
    *//**
    * @param {'message'} event
    * @param {({data: any}) => void} cb
    */
  addEventListener(event, cb) {
    const arr = this.callbacks.get(event);
    if (arr) {
      arr.push(cb);
    } else {
      this.socket.addEventListener(event, cb);
    }
  }

  /**
   * @param {any} data of JSON-serializable values
   * @param {undefined} [options] unsupported
   */
  send(data, options) {
    if (options) {
      throw Error("options unsupported");
    }
    this.socket.send(data);
  }
}

module.exports = FireSocket;

