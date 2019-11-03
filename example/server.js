const express = require("express");
const ws = require("ws");
const app = express();

app.use(express.static(__dirname));
const server = app.listen(8080, () => console.log("Running on http://localhost:8080"));

switch (process.argv[2]) {
case "ws":
  const wss = new ws.Server({server});
  wss.on("connection", ws => {
    ws.on("message", data => {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(data);
        }
      });
    });
  });
  break;
case "firesocket":
  throw Error("Not implemented!");
case undefined:
  console.error("usage: npm start [ws|firesocket]");
  process.exit(1);
}
