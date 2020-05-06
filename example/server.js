// Run with `npm start ws` or `npm start fs`
// @ts-nocheck

const express = require("express");
const app = express();

app.use(express.static(__dirname));
const server = app.listen(8080, () => console.log("Running on http://localhost:8080"));

/** @type import("../firesocket-server").Server */
let wss;
switch (process.argv[2]) {
  case "ws":
    const ws = require("ws");
    wss = new ws.Server({server});
    break;
  case "fs":
    const firesocket = require("../firesocket-server");
    // To run locally, set the env variable GOOGLE_APPLICATION_CREDENTIALS to this JSON path
    // gcloud iam service-accounts keys create .test-creds.json --iam-account server@firesocket-test.iam.gserviceaccount.com
    const config = {
      projectId: "firesocket-test",
      apiKey: "AIzaSyDOkMdK66buENmR9Hx5rnsHOQi2G2g7CZY",
      databaseURL: "https://firesocket-test.firebaseio.com",
      authDomain: "firesocket-test.firebaseapp.com",
    };
    wss = firesocket.Server.createFromCreds(
      "https://firesocket-test.firebaseio.com",
      {app, config},
    );
    break;
  case undefined:
    console.error("usage: npm start [ws|fs]");
    process.exit(1);
}

wss.on("connection", ws => {
  ws.addEventListener("message", data => { // TODO should support on()
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(data.data);
      }
    });
  });
});
