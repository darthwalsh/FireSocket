/* global describe it expect */

const Server = require("../server");

const testing = require("@firebase/testing");
const firebase = testing.initializeTestApp({
  databaseName: "testdb",
  auth: {}
});

describe("firesocket", () => {
  it("existing", async done => {
    const server = new Server(firebase);

    firebase.database().ref("server").set({ server: { user1: { 0: "message1" } } });

    const socket = await new Promise((res, rej) => {
      server.addEventListener("connection", s => { res(s) });
    });

    expect(new FireSocket("abc.xyz").address).toBe("abc.xyz");
  });
});
