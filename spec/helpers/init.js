/* global jasmine */

const path = require("path");
const reporters = require("jasmine-reporters");

const junitReporter = new reporters.JUnitXmlReporter({
  savePath: path.join(__dirname, "..", "results"),
  consolidateAll: false,
});
jasmine.getEnv().addReporter(junitReporter);

const isDebugger = /--debug|--inspect/.test(process.execArgv.join(" "));

// 3s is pretty long, but firebase emulators take a long time on cold start
jasmine.DEFAULT_TIMEOUT_INTERVAL = isDebugger ? 1000 * 60 * 60 : 3000;
