"use strict";
/** @typedef {import("firebase")} firebase */

class Socket {
  /**
   * @param {firebase.database.Reference} read
   * @param {firebase.database.Reference} write
   */
  constructor(read, write) {
    this.read = read;
    this.write = write;
    this.callbacks = new Map([["message", []]]);
    setTimeout(() => read.on("child_added", ss => this.onMessage(ss)));
  }
  /**
   * @param {firebase.database.DataSnapshot} snapshot
   */
  onMessage(snapshot) {
    if (snapshot.key === Socket.__CONNECTION) { // if switch to metadata records, create {kind: connection, data: ...}?
      return;
    }
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

  // TODO test this works
  /**
  * @param {'message'} event
  * @param {({data: any}) => void} cb
  */
  removeEventListener(event, cb) {
    const arr = this.callbacks.get(event);
    if (!arr) {
      throw new Error(`Unsupported event type ${event}`);
    }
    this.callbacks.set(event, arr.filter(f => f !== cb));
  }

  close() {
    this.read.off("child_added");
  }
}

Socket.__CONNECTION = "__CONNECTION";

module.exports = Socket;
