/* global describe it expect */
/** @typedef {import("firebase")} Firebase */

const Server = require("../server");
const FireSocket = require("../firesocket-server");

const testing = require("@firebase/testing");
const firebase = /** @type {Firebase} */ (
  /** @type {unknown} */ (testing.initializeTestApp({
    databaseName: "testDb",
    auth: {uid: "alice"},
  }))
);
const database = firebase.database();

describe("exiting message", () => {
  it("on server", async done => {
    await database.ref().set({user: {user1: {0: "message1"}}});

    // @ts-ignore
    const server = new Server(database);
    // @ts-ignore
    const data = await new Promise((res, rej) => {
      server.on("connection", socket => {
        socket.addEventListener("message", o => res(o.data));
      });
    });

    expect(data).toBe("message1");

    server.close(done);
  });

  it("on client", async done => {
    await database.ref().set({server: {user1: {0: "message1"}}});

    const client = new FireSocket("user1", firebase);
    // @ts-ignore
    const data = await new Promise((res, rej) => {
      client.addEventListener("message", o => res(o.data));
    });

    expect(data).toBe("message1");

    done();
  });
});

describe("sending", () => {
  it("client to server", async done => {
    await database.ref().set(null);

    const data = [];
    // @ts-ignore
    const server = new Server(database);
    const client = new FireSocket("user3", firebase);
    await new Promise((res, _) => {
      server.on("connection", socket =>
        socket.addEventListener("message", o => {
          data.push(o.data);
          if (data.length === 3) {
            res();
          }
        })
      );
      client.send("a");
      client.send("b");
      client.send("c");
    });

    expect(data).toEqual(["a", "b", "c"]);

    server.close(done);
  });

  it("server to client", async done => {
    await database.ref().set(null);

    const data = [];
    // @ts-ignore
    const server = new Server(database);
    server.on("connection", socket => {
      socket.send("i");
      socket.send("j");
      socket.send("k");
    });

    const client = new FireSocket("user4", firebase);

    await new Promise((res, _) => {
      client.addEventListener("message", o => {
        data.push(o.data);
        if (data.length === 3) {
          res();
        }
      });
    });

    expect(data).toEqual(["i", "j", "k"]);

    server.close(done);
  });
});

describe("readyState", () => {
  it("has properties", () => {
    expect(FireSocket.CONNECTING).toBe(0);
    expect(new FireSocket("user1", firebase).CONNECTING).toBe(0);
  });

  it("changes", async done => {
    await database.ref().set(null);

    const client = new FireSocket("user1", firebase);
    expect(client.readyState).toBe(FireSocket.CONNECTING);

    // @ts-ignore
    const server = new Server(database);

    const afterOpen = await new Promise((res, _) => {
      client.addEventListener("open", () => {
        res(client.readyState);
      });
    });
    expect(afterOpen).toBe(FireSocket.OPEN);

    server.close(done);
  });
});

// TODO(open) the client open event should only fire when the server is connected

// TODO(close) test that close stops the db and HTTP listening events
