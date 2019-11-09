// Run with `npm run cli http://localhost:8080 name`

const readline = require("readline");
const WebSocket = require("ws"); // TODO conditional

const [, , url, name] = process.argv; // TODO auth instead of name
if (!url || !name) {
  console.error("Expected usage: cli URL NAME");
  process.exit(1);
}

const rl = readline.createInterface(process.stdin, process.stdout);

const wsUrl = url.replace(/^http/, "ws");
const ws = new WebSocket(wsUrl);
ws.addEventListener("open", () =>
  rl.on("line", input => ws.send(input))
);

ws.addEventListener("message", e => console.log(e.data));

ws.addEventListener("close", () => {
  console.log("Connection to Server lost");
  process.exit(1);
});
