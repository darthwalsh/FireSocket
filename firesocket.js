"use strict";
/** @typedef {import("firebase")} firebase */

const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

class FireSocket {
  /**
   * @param {(String|any)} [address] ignored
   * @param {(String|String[])} [protocols] ignored
   * @param {Object} [options] Connection options
   * @param {string} [options.uid] user id (skips sign in)
   */
  constructor(address, protocols, options = {}) {
    this.callbacks = new Map([
      ["open", []],
      ["message", []],
    ]);
    this.readyState = FireSocket.CONNECTING;

    this.init(options);
  }

  /**
   * @param {Object} options Implementation details
   * @param {string} [options.uid] user id (skips sign in)
   */
  async init({uid}) {
    if (!firebase.apps.length) {
      const response = await fetch("/firebase-config.json");
      firebase.initializeApp(await response.json());
    }

    this.database = firebase.database();
    if (!uid) {
      let user = firebase.auth().currentUser;
      if (!user) {
        // MAYBE this could be extended to session, but client would need API to restart connection
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
        const cred = await firebase.auth().signInAnonymously();
        user = cred.user;
      }

      uid = user.uid;
    }

    this.write = this.database.ref(`user/${uid}`);
    this.write.update({"__CONNECTION": true}, () => this.onOpen());
    this.read = this.database.ref(`server/${uid}`);
    setTimeout(() => this.read.on("child_added", ss => this.onMessage(ss)));
  }

  /**
   * @param {firebase.database.DataSnapshot} snapshot
   */
  onMessage(snapshot) {
    if (snapshot.key === "__CONNECTION") { // if switch to metadata records, create {kind: connection, data: ...}?
      return;
    }
    const data = snapshot.val();
    this.callbacks.get("message").forEach(cb => cb({data}));
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
    const arr = this.callbacks.get(event);
    if (!arr) {
      throw new Error(`Unsupported event type ${event}`);
    }
    arr.push(cb);
  }

  /**
   * @param {any} data of JSON-serializable values
   * @param {undefined} [options] unsupported
   */
  send(data, options) {
    if (options) {
      throw Error("options unsupported");
    }
    if (!this.write) {
      throw Error("invalid state for send");
    }
    this.write.push().set(data);
  }
}

FireSocket.CONNECTING = 0;
FireSocket.OPEN = 1;
FireSocket.CLOSING = 2;
FireSocket.CLOSED = 3;

if (typeof window !== "undefined") {
  window["FireSocket"] = FireSocket;
}

module.exports = FireSocket;
