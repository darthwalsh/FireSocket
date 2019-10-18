/* global describe it expect */

const Server = require("../server");
const FireSocket = require("../firesocket");

const testing = require("@firebase/testing");
const firebase = testing.initializeTestApp({
  databaseName: "testDb",
  auth: {uid: "alice"},
});
const database = firebase.database();

describe("exiting message", () => {
  it("on server", async done => {
    await database.ref().set({user: {user1: {0: "message1"}}});

    const server = new Server(firebase);
    const data = await new Promise((res, rej) => {
      server.addEventListener("connection", socket => {
        socket.addEventListener("message", o => res(o.data));
      });
    });

    expect(data).toBe("message1");

    done();
  });

  it("on client", async done => {
    await database.ref().set({server: {user1: {0: "message1"}}});

    const client = new FireSocket("user1", firebase);
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
    const server = new Server(firebase);
    const client = new FireSocket("user1", firebase);
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

    new Server(firebase);

    const afterOpen = await new Promise((res, _) => {
      client.addEventListener("open", () => {
        res(client.readyState);
      });
    });
    expect(afterOpen).toBe(FireSocket.OPEN);

    // TODO test close

    done();
  });
});

// TODO the client open event should only fire when the server is connected

// TODO test that close stops the db listening events? https://firebase.google.com/docs/database/web/read-and-write#detach_listeners
