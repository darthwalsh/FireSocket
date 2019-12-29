// Run with `npm start ws` or `npm start fs`

const express = require("express");
const app = express();

app.use(express.static(__dirname));
const server = app.listen(8080, () => console.log("Running on http://localhost:8080"));

/** @type import("../firesocket").Server */
let wss;
switch (process.argv[2]) {
case "ws":
  const ws = require("ws");
  wss = new ws.Server({server});
  break;
case "fs":
  const firesocket = require("../firesocket");
  const creds = require("./.test-creds.json");
  wss = firesocket.Server.createFromCreds(
    creds,
    "https://firesocket-test.firebaseio.com",
    {uid: "server"},
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
