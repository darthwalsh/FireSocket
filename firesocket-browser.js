"use strict";
/** @typedef {import("firebase")} firebase */

const FireSocketCommon = require("./firesocket");

class FireSocket {
  constructor() {
    this.fireSocket = /** @type firebase */ (null);

    this.fireLoaded = Promise.all([this.loadConfig(), ...["app", "auth", "database"].map(this.loadFire)])
      .then(([config]) => {
        firebase.initializeApp(config);
        this.fireSocket = new FireSocketCommon("TODO" + Math.random().toString(36).substring(7), firebase);
      });
  }

  loadFire(component) {
    //TODO check if script with this src or id loaded, in case open twice
    const script = document.createElement("script");
    // script.type = "text/javascript"; //TODO needed?
    script.src = `https://www.gstatic.com/firebasejs/7.6.1/firebase-${component}.js`; // MAYBE version can come from server package.json?
    
    const promise = new Promise((res, _) => {
      script.onload = res;
    });

    document.head.appendChild(script);
    return promise;
  }

  async loadConfig() {
    const response = await fetch("/firebase-config.json");
    return response.json();
  }
}

// TODO test that this works in the compatibility layers!
for (const [k, v] of Object.entries(FireSocketCommon)) {
  if (typeof v === "number") {
    FireSocket[k] = v;
  } else {
    throw Error(`Unexpected reflection ${k}, ${v}`);
  }
}

for (const k of Object.getOwnPropertyNames(FireSocketCommon.prototype)) {
  const v = FireSocketCommon.prototype[k];
  if (typeof v === "number") {
    FireSocket.prototype[k] = v;
  } else if (typeof v === "function") {
    FireSocket.prototype[k] = function(...args) {
      this.fireLoaded.then(() => this.fireSocket[k](...args));
    }
  } else {
    throw Error(`Unexpected reflection ${k}, ${v}`);
  }
}

if (window) {
  window.FireSocket = FireSocket;
}

module.exports = FireSocket;
