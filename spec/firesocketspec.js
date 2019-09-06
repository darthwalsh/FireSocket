/* global describe it expect */

const FireSocket = require("../firesocket");

describe("firesocket", () => {
  it("address", () => {
    expect(new FireSocket("abc.xyz").address).toBe("abc.xyz");
  });
});
