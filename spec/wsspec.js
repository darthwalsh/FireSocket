/* global describe it beforeEach expect */

/*
  If modifying this file to change the expected behavior, than run this before running tests:
  export FIRESOCKET_RUN_WS_BASELINE=TRUE

  The ws server is pretty flaky to repeated creation and closing on *nix, so not running all the time.
*/

const process = require("process");
const testing = require("@firebase/testing");
const firebase = testing.initializeTestApp({
  databaseName: "testDb",
  auth: {uid: "alice"},
});
const database = firebase.database();

describe("firesocket baseline", () =>
  testSocket(
    require("../firesocket-server"),
    () => ["user1", firebase],
    () => [database]
  ));
let port = 8082;

if (process.env.FIRESOCKET_RUN_WS_BASELINE) {
  console.log("Running WS_BASELINE tests");
  describe("ws baseline", () =>
    testSocket(
      require("ws"),
      () => ["ws://localhost:" + port],
      () => [{port}]
    ));
}

function testSocket(Socket, clientArgs, serverArgs) {
  beforeEach(() => ++port);

  it("client to server", async () => {
    await database.ref().set(null);

    const data = [];
    const server = new Socket.Server(...serverArgs());
    await listening(server);
    const client = new Socket(...clientArgs());
    const opened = new Promise((res, _) => client.addEventListener("open", res));
    await new Promise((res, _) => {
      server.on("connection", socket =>
        socket.addEventListener("message", o => {
          data.push(o.data);
          if (data.length === 3) {
            res();
          }
        })
      );
      opened.then(() => {
        client.send("a");
        client.send("b");
        client.send("c");
      });
    });

    expect(data).toEqual(["a", "b", "c"]);

    await new Promise((res, _) => server.close(res));
  });

  it("server to client", async () => {
    await database.ref().set(null);

    const data = [];
    const server = new Socket.Server(...serverArgs());
    await listening(server);
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

    await new Promise((res, _) => server.close(res));
  });

  it("has readyState properties", () => {
    expect(Socket.CONNECTING).toBe(0);
    expect(new Socket(...clientArgs()).CONNECTING).toBe(0);
  });

  it("readyState changes", async () => {
    await database.ref().set(null);

    const client = new Socket(...clientArgs());
    expect(client.readyState).toBe(Socket.CONNECTING);
    const afterOpen = new Promise((res, _) => {
      client.addEventListener("open", () => {
        res(client.readyState);
      });
    });

    const server = new Socket.Server(...serverArgs());
    await listening(server);

    expect(await afterOpen).toBe(Socket.OPEN);

    await new Promise((res, _) => server.close(res));
  });
}

function listening(server) {
  return new Promise(res => server.on("listening", res));
}
