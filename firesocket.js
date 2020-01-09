"use strict";
/** @typedef {import("firebase")} firebase */

const Socket = require("./socket");

class FireSocket {
  /**
   * @param {string} uid
   * @param {firebase} firebase
   */
  constructor(uid, firebase) {
    this.database = firebase.database();
    this.callbacks = new Map([ // events not in common with socket
      ["open", []],
    ]);
    this.readyState = FireSocket.CONNECTING;
    const write = this.database.ref(`user/${uid}`);
    write.update({[Socket.__CONNECTION]: true}); //TODO(open), () => this.onOpen());
    // @ts-ignore
    write.onDisconnect().update({ [Socket.__CONNECTION]: firebase.database.ServerValue.TIMESTAMP });
    const read = this.database.ref(`server/${uid}`);
    this.socket = new Socket(/** @type {any} */(read), /** @type {any} */(write));
    // const connected = ss => 
    //   this.read.on(
  }

  onOpen() {
    this.readyState = FireSocket.OPEN;
    this.callbacks.get("open").forEach(cb => cb());
  }

  get CONNECTING() {
    return FireSocket.CONNECTING;
  }
  get CLOSING() {
    return FireSocket.CLOSING;
  }
  get CLOSED() {
    return FireSocket.CLOSED;
  }
  get OPEN() {
    return FireSocket.OPEN;
  }

  /**
   * @callback onEvent
   * @param {{ data?: any }} cb
   */

  /**
    * @param {'open' | 'close' | 'message'} event
    * @param {onEvent} cb
    */
  addEventListener(event, cb) {
    // TODO(close) actually fire the close event and set the readyState
    if (event === 'message' && this.readyState !== FireSocket.OPEN) {
      //throw "need to delay adding message events until after __CONNECTION!";
    }

    const arr = this.callbacks.get(event);
    if (arr) {
      arr.push(cb);
    } else {
      this.socket.addEventListener(/** @type {any} **/(event), cb);
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

FireSocket.CONNECTING = 0;
FireSocket.OPEN = 1;
FireSocket.CLOSING = 2;
FireSocket.CLOSED = 3;

module.exports = FireSocket;
