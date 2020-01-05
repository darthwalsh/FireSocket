"use strict";
/* global firebase */

/** @typedef {import("firebase")} firebase */

const FireSocketCommon = require("./firesocket");

class FireSocket {
  constructor() {
    this.fireSocket = /** @type {FireSocketCommon} */ (null);

    this.fireLoaded = Promise.all([this.loadConfig(), ...["app", "auth", "database"].map(c => this.loadFire(c))])
      .then(async ([config]) => {
        this.getGlobalFireBase().initializeApp(config);
        const uid = await this.signInUser(this.getGlobalFireBase());
        this.fireSocket = new FireSocketCommon(uid, this.getGlobalFireBase());
      });
  }

  loadFire(component) {
    const id = "firebase-loadFire-" + component;
    if (this.getGlobalFireBase() || document.getElementById(id)) {
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = `https://www.gstatic.com/firebasejs/7.6.1/firebase-${component}.js`; // MAYBE version can come from server package.json?

    const promise = new Promise((res, _) => {
      script.onload = res;
    });

    document.head.appendChild(script);
    return promise;
  }

  /**
  * @returns {firebase}
  */
  getGlobalFireBase() {
    // @ts-ignore global loaded by the html scripts
    return typeof firebase !== "undefined" && firebase;
  }

  async loadConfig() {
    const response = await fetch("/firebase-config.json");
    return response.json();
  }

  /**
   * @param {firebase} [firebase]
   * @returns {Promise<string>} uid
   */
  async signInUser(firebase) {
    // @ts-ignore
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE); // MAYBE this could be extended to session, but client would need API to restart connection
    // @ts-ignore
    const cred = await firebase.auth().signInAnonymously();
    return cred.user.uid;
  }
}

// Copy all the static and instance properties to run after after fireLoaded
for (const k of Object.getOwnPropertyNames(FireSocketCommon.prototype)) {
  const v = FireSocketCommon.prototype[k];
  if (typeof v === "number") {
    FireSocket.prototype[k] = v;
  } else if (typeof v === "function") {
    FireSocket.prototype[k] = function(...args) {
      this.fireLoaded.then(() => this.fireSocket[k](...args));
    };
  } else {
    throw Error(`Unexpected reflection ${k}, ${v}`);
  }
}
for (const [k, v] of Object.entries(FireSocketCommon)) {
  if (typeof v === "number") {
    FireSocket[k] = v;
  } else {
    throw Error(`Unexpected reflection ${k}, ${v}`);
  }
}

// @ts-ignore
window.FireSocket = FireSocket;

module.exports = FireSocket;
