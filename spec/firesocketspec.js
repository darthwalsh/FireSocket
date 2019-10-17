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
