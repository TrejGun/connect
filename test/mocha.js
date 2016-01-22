"use strict";

require("babel-core/register");
require("babel-polyfill");


Error.stackTraceLimit = Infinity;

const debug = require("debug");
if (process.env.ABL_DEBUG === "true") {
	debug.enable("API:*");
}

const q = require("q");
q.longStackSupport = true;

process.on("uncaughtException", (exception) => {
	debug("log:mocha")(exception);
});
