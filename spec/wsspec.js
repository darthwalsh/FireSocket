/* global describe it expect */

const FireSocket = require("../firesocket");
const WebSocket = require("ws");

const testing = require("@firebase/testing");
const firebase = testing.initializeTestApp({
  databaseName: "testDb",
  auth: {uid: "alice"},
});
const database = firebase.database();

describe("firesocket works", () => testSocket(FireSocket));
describe("ws baseline", () => testSocket(WebSocket));

function testSocket(Socket) {
  it("client to server", async done => {
    await database.ref().set(null);

    const data = [];
    const server = new Server(firebase);
    const client = new Socket("user1", firebase);
    await new Promise((res, _) => {
      server.addEventListener("connection", socket =>
        socket.addEventListener("message", o => {
          data.push(o.data);
          if (data.length === 3) {
            res();
          }
        }));
      client.send("a");
      client.send("b");
      client.send("c");
    });

    expect(data).toEqual(["a", "b", "c"]);

    done();
  });

  it("server to client", async done => {
    await database.ref().set(null);

    const data = [];
    const server = new Server(firebase);
    server.addEventListener("connection", socket => {
      socket.send("a");
      socket.send("b");
      socket.send("c");
    });

    const client = new FireSocket("user1", firebase);

    await new Promise((res, _) => {
      client.addEventListener("message", o => {
        data.push(o.data);
        if (data.length === 3) {
          res();
        }
      });
    });

    expect(data).toEqual(["a", "b", "c"]);

    done();
  });

  it("has readyState properties", () => {
    expect(FireSocket.CONNECTING).toBe(0);
    expect(new FireSocket("user1", firebase).CONNECTING).toBe(0);
  });

  it("readyState changes", async done => {
    await database.ref().set(null);

    const client = new FireSocket("user1", firebase);
    expect(client.readyState).toBe(FireSocket.CONNECTING);

    new Server(firebase);

    const afterOpen = await new Promise((res, _) => {
      client.addEventListener("open", () => {
        res(client.readyState);
      });
    });
    expect(afterOpen).toBe(FireSocket.OPEN);

    // TODO(close) test close

    done();
  });
}
