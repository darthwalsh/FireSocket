// Run with `npm run cli http://localhost:8080` or `npm run cli fs`
// @ts-nocheck

const readline = require("readline");
const WebSocket = require("ws");

(async () => {
  const [, , url,] = process.argv;
  if (!url) {
    console.error("Expected usage: cli [URL|fs]");
    process.exit(1);
  }

  const rl = readline.createInterface(process.stdin, process.stdout);

  let ws;
  if (url !== "fs") {
    const wsUrl = url.replace(/^http/, "ws");
    ws = new WebSocket(wsUrl);
  } else {
    const FireSocket = require("../firesocket");
    const firebase = require("firebase");
    const config = {
      apiKey: "AIzaSyDOkMdK66buENmR9Hx5rnsHOQi2G2g7CZY",
      authDomain: "firesocket-test.firebaseapp.com",
      databaseURL: "https://firesocket-test.firebaseio.com",
      storageBucket: "firesocket-test.appspot.com",
    };
    firebase.initializeApp(config);

    const cred = await firebase.auth().signInAnonymously();
    ws = new FireSocket(cred.user.uid, firebase);
  }
  ws.addEventListener("open", () =>
    rl.on("line", input => ws.send(input))
  );

  ws.addEventListener("message", e => console.log(e.data));

  // TODO?
  // ws.addEventListener("close", () => {
  //   console.log("Connection to Server lost");
  //   process.exit(1);
  // });
})();
