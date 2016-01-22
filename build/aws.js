"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _desc, _value, _class, _class2, _temp;

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _querystring = require("querystring");

var _querystring2 = _interopRequireDefault(_querystring);

var _mime = require("mime");

var _mime2 = _interopRequireDefault(_mime);

var _coreDecorators = require("core-decorators");

var _utils = require("./utils/utils");

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

function ensureLeadingSlash(filename) {
	return filename[0] !== "/" ? "/" + filename : filename;
}

function getEpoch(expires) {
	var date = new Date();
	date.setMinutes(date.getMinutes() + expires);
	return Math.floor(date.getTime() / 1000);
}

function hmacSha1(secret, message) {
	return _crypto2.default.createHmac("sha1", secret).update(new Buffer(message, "utf-8")).digest("base64");
}

function canonicalizeHeaders(headers) {
	var buf = [];
	var fields = Object.keys(headers);
	for (var i = 0, len = fields.length; i < len; ++i) {
		var field = fields[i];
		var val = headers[field];

		field = field.toLowerCase();

		if (field.indexOf("x-amz") !== 0 || field === "x-amz-date") {
			continue;
		}

		buf.push(field + ":" + val);
	}

	return buf.sort(function (a, b) {
		// Headers are sorted lexigraphically based on the header name only.
		return a.split(":")[0] > b.split(":")[0] ? 1 : -1;
	}).join("\n");
}

function queryStringToSign(resource, mimeType, epoch) {
	return "PUT\n\n" + mimeType + "\n" + epoch + "\n" + canonicalizeHeaders({ "x-amz-acl": "public-read" }) + "\n" + resource;
}

exports.default = new (_dec = (0, _coreDecorators.decorate)(_decorators.promise), (_class = (_temp = _class2 = function (_Debuggable) {
	_inherits(AWSAPI, _Debuggable);

	function AWSAPI() {
		_classCallCheck(this, AWSAPI);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(AWSAPI).apply(this, arguments));
	}

	_createClass(AWSAPI, [{
		key: "getSignedUrl",

		// THIS FUNCTION IS HALF-ASSED and only works for standard region in S3
		value: function getSignedUrl(fileName, expires) {
			var fixedFileName = decodeURIComponent(decodeURIComponent(fileName));
			var signedUrl = "https://s3.amazonaws.com";
			var pathname = _url2.default.parse(fixedFileName).pathname;
			var resource = "/" + this.config.s3.bucket + ensureLeadingSlash(pathname);
			var mimeType = _mime2.default.lookup(fixedFileName);
			if (["image/png", "image/jpeg"].indexOf(mimeType) === -1) {
				return _q2.default.reject({
					success: false,
					message: "Wrong mime type"
				});
			}
			var epoch = getEpoch(expires);
			var message = queryStringToSign(resource, mimeType, epoch);
			var signature = hmacSha1(this.config.s3.s3Options.secretAccessKey, message);
			var queryString = _querystring2.default.stringify({
				Expires: epoch,
				AWSAccessKeyId: this.config.s3.s3Options.accessKeyId,
				Signature: signature
			});
			return (0, _q2.default)({
				success: true,
				url: signedUrl + resource + "?" + queryString,
				file: (0, _utils.getRandomString)(20),
				bucketUrl: this.config.s3.url
			});
		}
	}]);

	return AWSAPI;
}(_debuggable2.default), _class2.key = "AWS_API", _temp), (_applyDecoratedDescriptor(_class.prototype, "getSignedUrl", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "getSignedUrl"), _class.prototype)), _class))();