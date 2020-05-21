/* global describe it expect */
const fs = require("fs");
const path = require("path");

describe("package.json", () => {
  it("all files exist", async done => {
    const package = require(path.join(__dirname, "..", "package.json"));
    const files = package.files;

    expect(files.length).toBeGreaterThan(0);

    const missing = (await Promise.all(files.map(existsRoot))).filter(({exists}) => !exists).map(({file}) => file);

    expect(missing.length).withContext("Missing: " + missing.join()).toBeFalsy();
  
    done();
  });
});

/**
 * @param {string} file
 */
function existsRoot(file) {
  return new Promise(res =>
    fs.exists(path.join(__dirname, "..", file), exists => res({file, exists}))
  );
}
