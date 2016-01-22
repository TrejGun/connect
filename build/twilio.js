"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _desc, _value, _class, _class2, _temp;

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _twilio = require("twilio");

var _twilio2 = _interopRequireDefault(_twilio);

var _coreDecorators = require("core-decorators");

var _decorators = require("./utils/decorators");

var _debuggable = require("./utils/debuggable");

var _debuggable2 = _interopRequireDefault(_debuggable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

exports.default = new (_dec = (0, _coreDecorators.decorate)(_decorators.promise), (_class = (_temp = _class2 = function (_Debuggable) {
	_inherits(TwilioAPI, _Debuggable);

	function TwilioAPI() {
		_classCallCheck(this, TwilioAPI);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(TwilioAPI).apply(this, arguments));
	}

	_createClass(TwilioAPI, [{
		key: "getClient",
		value: function getClient() {
			return (0, _twilio2.default)(this.config.AccountSID, this.config.AuthToken);
		}

		// https://www.twilio.com/docs/api/rest/sending-messages

	}, {
		key: "sendSMS",
		value: function sendSMS(message) {
			return this.client.messages.create(Object.assign(message.toObject(), { from: this.config.from }));
		}
	}]);

	return TwilioAPI;
}(_debuggable2.default), _class2.key = "TWILIO_API", _temp), (_applyDecoratedDescriptor(_class.prototype, "getClient", [_coreDecorators.override], Object.getOwnPropertyDescriptor(_class.prototype, "getClient"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "sendSMS", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "sendSMS"), _class.prototype)), _class))();