/* global describe it beforeEach expect */

const testing = require("@firebase/testing");
const firebase = testing.initializeTestApp({
  databaseName: "testDb",
  auth: {uid: "alice"},
});
const database = firebase.database();

describe("firesocket baseline",
  () => testSocket(require("../firesocket-server"),
    () => ["user1", firebase],
    () => [database]));
let port = 8082;
describe("ws baseline",
  () => testSocket(require("ws"),
    () => ["ws://localhost:" + port],
    () => [{port}]));

function testSocket(Socket, clientArgs, serverArgs) {
  beforeEach(() => ++port);

  it("client to server", async done => {
    await database.ref().set(null);

    const data = [];
    const server = new Socket.Server(...serverArgs());
    const client = new Socket(...clientArgs());
    const opened = new Promise((res, _ )=> client.addEventListener("open", res));
    await new Promise((res, _) => {
      server.on("connection", socket =>
        socket.addEventListener("message", o => {
          data.push(o.data);
          if (data.length === 3) {
            res();
          }
        }));
      opened.then(() => {
        client.send("a");
        client.send("b");
        client.send("c");
      });
    });

    expect(data).toEqual(["a", "b", "c"]);

    server.close(done);
  });

  it("server to client", async done => {
    await database.ref().set(null);

    const data = [];
    const server = new Socket.Server(...serverArgs());
    server.on("connection", socket => {
      socket.send("a");
      socket.send("b");
      socket.send("c");
    });

    const client = new Socket(...clientArgs());

    await new Promise((res, _) => {
      client.addEventListener("message", o => {
        data.push(o.data);
        if (data.length === 3) {
          res();
        }
      });
    });

    expect(data).toEqual(["a", "b", "c"]);

    server.close(done);
  });

  it("has readyState properties", () => {
    expect(Socket.CONNECTING).toBe(0);
    expect(new Socket(...clientArgs()).CONNECTING).toBe(0);
  });

  it("readyState changes", async done => {
    await database.ref().set(null);

    const client = new Socket(...clientArgs());
    expect(client.readyState).toBe(Socket.CONNECTING);

    const server = new Socket.Server(...serverArgs());

    const afterOpen = await new Promise((res, _) => {
      client.addEventListener("open", () => {
        res(client.readyState);
      });
    });
    expect(afterOpen).toBe(Socket.OPEN);

    server.close(done);
  });
}
