/* global describe it expect */

const Server = require("../server");
const Client = require("../client");

const testing = require("@firebase/testing");
const firebase = testing.initializeTestApp({
  databaseName: "testDb",
  auth: {uid: "alice"},
});

describe("firesocket", () => {
  it("existing", async done => {
    firebase.database().ref().set({user: {user1: {0: "message1"}}});

    const server = new Server(firebase);

    const client = new Client(firebase);

    client.addEventListener("message");

    const data = await new Promise((res, rej) => {
      server.addEventListener("connection", socket => {
        socket.addEventListener("message", o => res(o.data));
      });
    });

    expect(data).toBe("message1");

    done();
  });
});
