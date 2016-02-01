"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.callback = callback;
exports.promise = promise;
exports.payment = payment;

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _misc = require("abl-utils/build/misc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeError(key) {
	return new Error("process.env." + key + " != true, method is mocked up!");
}

function callback(fn) {
	return function callbackInner() {
		var _this = this;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (process.env[this.constructor.key] === "true") {
			fn.bind(this).apply(undefined, args);
		} else {
			process.nextTick(function () {
				args[0](makeError(_this.constructor.key)); // done
			});
		}
	};
}

function promise(fn) {
	return function promiseInner() {
		if (process.env[this.constructor.key] === "true") {
			return fn.bind(this).apply(undefined, arguments);
		} else {
			return _q2.default.reject(makeError(this.constructor.key));
		}
	};
}

function payment(fn) {
	return function paymentInner(paymentMethod) {
		if (paymentMethod === "credit") {
			for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
				args[_key2 - 1] = arguments[_key2];
			}

			return fn.bind(this).apply(undefined, args);
		} else {
			return _q2.default.resolve({ id: "abl_" + (0, _misc.getRandomString)(20) });
		}
	};
}