"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _config = require("./../config/config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Debuggable = function () {
	function Debuggable(isDebuggable) {
		var _this = this;

		_classCallCheck(this, Debuggable);

		this.displayName = "Debuggable";
		this.config = {};
		this._client = null;

		this.displayName = this.constructor.name.slice(0, -3).toLowerCase();
		this.config = _config2.default[this.displayName];

		if (isDebuggable) {
			this.log = function () {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				return (0, _debug2.default)("connect:" + _this.displayName).apply(undefined, _toConsumableArray(args.map(function (arg) {
					return _util2.default.inspect(arg, { depth: 10, colors: true });
				})));
			};
		} else {
			this.log = function () {
				return null;
			};
		}
	}

	_createClass(Debuggable, [{
		key: "getClient",
		value: function getClient() {
			throw new Error("getClient should be override");
		}
	}, {
		key: "client",
		get: function get() {
			if (!this._client) {
				this._client = this.getClient();
			}
			return this._client;
		}
	}]);

	return Debuggable;
}();

exports.default = Debuggable;