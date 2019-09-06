/* global jasmine */

const path = require("path");
const reporters = require("jasmine-reporters");

const junitReporter = new reporters.JUnitXmlReporter({
  savePath: path.join(__dirname, "..", "results"),
  consolidateAll: false,
});
jasmine.getEnv().addReporter(junitReporter);

const isDebugger = /--debug|--inspect/.test(process.execArgv.join(" "));

jasmine.DEFAULT_TIMEOUT_INTERVAL = isDebugger ? 1000 * 60 * 60 : 1500;
