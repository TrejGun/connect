"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getRandomString = getRandomString;
exports.countAttendees = countAttendees;
exports.getCurrency = getCurrency;

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getRandomString() {
	var length = arguments.length <= 0 || arguments[0] === undefined ? 64 : arguments[0];
	var type = arguments.length <= 1 || arguments[1] === undefined ? 3 : arguments[1];

	var chars = ["0123456789", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
	var randomBytes = _crypto2.default.randomBytes(length);
	var result = new Array(length);
	var cursor = 0;
	for (var i = 0; i < length; i++) {
		cursor += randomBytes[i];
		result[i] = chars[type][cursor % chars[type].length];
	}
	return result.join("");
}

function countAttendees(attendees) {
	return Object.keys(attendees || {}).reduce(function (memo, key) {
		return memo + attendees[key];
	}, 0);
}

function getCurrency(user) {
	if (user.payment) {
		return user.payment.currency;
	} else {
		return user.location && user.location.countryCode.toLowerCase() === "ca" ? "cad" : "usd";
	}
}