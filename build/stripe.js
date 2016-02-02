"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _desc, _value, _class, _class2, _temp;

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _stripe = require("stripe");

var _stripe2 = _interopRequireDefault(_stripe);

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

exports.default = new (_dec = (0, _coreDecorators.decorate)(_decorators.promise), _dec2 = (0, _coreDecorators.decorate)(_decorators.payment), _dec3 = (0, _coreDecorators.decorate)(_decorators.promise), _dec4 = (0, _coreDecorators.decorate)(_decorators.promise), _dec5 = (0, _coreDecorators.decorate)(_decorators.promise), _dec6 = (0, _coreDecorators.decorate)(_decorators.payment), _dec7 = (0, _coreDecorators.decorate)(_decorators.promise), _dec8 = (0, _coreDecorators.decorate)(_decorators.promise), _dec9 = (0, _coreDecorators.decorate)(_decorators.promise), _dec10 = (0, _coreDecorators.decorate)(_decorators.promise), _dec11 = (0, _coreDecorators.decorate)(_decorators.promise), _dec12 = (0, _coreDecorators.decorate)(_decorators.promise), _dec13 = (0, _coreDecorators.decorate)(_decorators.promise), _dec14 = (0, _coreDecorators.decorate)(_decorators.promise), _dec15 = (0, _coreDecorators.decorate)(_decorators.promise), _dec16 = (0, _coreDecorators.decorate)(_decorators.promise), _dec17 = (0, _coreDecorators.decorate)(_decorators.promise), _dec18 = (0, _coreDecorators.decorate)(_decorators.promise), (_class = (_temp = _class2 = function (_Debuggable) {
	_inherits(StripeAPI, _Debuggable);

	function StripeAPI() {
		_classCallCheck(this, StripeAPI);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(StripeAPI).apply(this, arguments));
	}

	_createClass(StripeAPI, [{
		key: "getClient",
		value: function getClient() {
			return (0, _stripe2.default)(this.config.privateKey);
		}

		// CHARGE

	}, {
		key: "chargesCreate",
		value: function chargesCreate(user, data, options) {
			return (0, _stripe2.default)(user.payment.privateKey).charges.create(data, options);
		}
	}, {
		key: "chargesRetrieve",
		value: function chargesRetrieve(user, data) {
			return (0, _stripe2.default)(user.payment.privateKey).charges.retrieve(data);
		}
	}, {
		key: "chargesList",
		value: function chargesList(user, data) {
			return (0, _stripe2.default)(user.payment.privateKey).charges.list(data);
		}

		// REFUND

	}, {
		key: "refundsCreate",
		value: function refundsCreate(user, data) {
			return (0, _stripe2.default)(user.payment.privateKey).refunds.create(data);
		}

		// MANAGED ACCOUNT

	}, {
		key: "createManagedAccount",
		value: function createManagedAccount(user, data) {
			return this.client.accounts.create({
				managed: true,
				country: data.country,
				email: user.email,
				business_name: user.companyName, // eslint-disable-line camelcase
				business_url: user.domainName, // eslint-disable-line camelcase
				debit_negative_balances: true, // eslint-disable-line camelcase
				default_currency: (0, _utils.getCurrency)(user), // eslint-disable-line camelcase
				statement_descriptor: user.companyName.substring(0, 22), // eslint-disable-line camelcase
				tos_acceptance: { // eslint-disable-line camelcase
					date: Date.now(),
					ip: data.ip,
					user_agent: data.ua // eslint-disable-line camelcase
				},
				transfer_schedule: { // eslint-disable-line camelcase
					delay_days: 7, // eslint-disable-line camelcase
					interval: "daily" // eslint-disable-line camelcase
				}
			});
		}
	}, {
		key: "updateManagedAccount",
		value: function updateManagedAccount(user, data) {
			return this.client.accounts.update(user.payment.account, data);
		}
	}, {
		key: "retrieveManagedAccount",
		value: function retrieveManagedAccount(user) {
			return this.client.accounts.retrieve(user.payment.account);
		}
	}, {
		key: "deleteManagedAccount",
		value: function deleteManagedAccount(user) {
			return this.client.accounts.del(user.payment.account);
		}
	}, {
		key: "listManagedAccount",
		value: function listManagedAccount() {
			return this.client.accounts.list({
				limit: 100
			});
		}

		// EXTERNAL ACCOUNT

	}, {
		key: "createExternalAccount",
		value: function createExternalAccount(user, data) {
			return this.client.accounts.createExternalAccount(user.payment.account, {
				external_account: { // eslint-disable-line camelcase
					object: "bank_account",
					country: data.country,
					currency: data.currency,
					routing_number: data.routing_number, // eslint-disable-line camelcase
					account_number: data.account_number, // eslint-disable-line camelcase
					default_for_currency: data.default_for_currency // eslint-disable-line camelcase
				}
			});
		}
	}, {
		key: "updateExternalAccount",
		value: function updateExternalAccount(user, data) {
			return this.client.accounts.updateExternalAccount(user.payment.account, data.bankAccountId, {
				default_for_currency: data.default_for_currency // eslint-disable-line camelcase
			});
		}
	}, {
		key: "retrieveExternalAccount",
		value: function retrieveExternalAccount(user, data) {
			return this.client.accounts.retrieveBank_account(user.payment.account, data.bankAccountId);
		}
	}, {
		key: "deleteExternalAccount",
		value: function deleteExternalAccount(user, data) {
			return this.client.accounts.deleteExternalAccount(user.payment.account, data.bankAccountId);
		}

		// TRANSFER

	}, {
		key: "transferCreate",
		value: function transferCreate(user, data, options) {
			return (0, _stripe2.default)(user.payment.privateKey).transfers.create(data, options);
		}
	}, {
		key: "transferList",
		value: function transferList(user, data) {
			return (0, _stripe2.default)(user.payment.privateKey).transfers.list(data);
		}

		// BALANCE

	}, {
		key: "transactionsList",
		value: function transactionsList(user, data) {
			return (0, _stripe2.default)(user.payment.privateKey).balance.listTransactions(data);
		}

		// FILE UPLOAD

	}, {
		key: "fileUploads",
		value: function fileUploads(user, data) {
			var _this2 = this;

			return this.client.fileUploads.create({
				purpose: "identity_document",
				file: {
					data: _fs2.default.readFileSync(data.image.path),
					name: "image.jpg",
					type: "application/octet-stream"
				}
			}, {
				stripe_account: user.payment.account // eslint-disable-line camelcase
			}).then(function (file) {
				return _this2.client.accounts.update(user.payment.account, {
					legal_entity: { // eslint-disable-line camelcase
						verification: {
							document: file.id
						}
					}
				});
			});
		}
	}]);

	return StripeAPI;
}(_debuggable2.default), _class2.key = "STRIPE_API", _temp), (_applyDecoratedDescriptor(_class.prototype, "getClient", [_coreDecorators.override], Object.getOwnPropertyDescriptor(_class.prototype, "getClient"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "chargesCreate", [_dec, _dec2], Object.getOwnPropertyDescriptor(_class.prototype, "chargesCreate"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "chargesRetrieve", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "chargesRetrieve"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "chargesList", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "chargesList"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "refundsCreate", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class.prototype, "refundsCreate"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createManagedAccount", [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, "createManagedAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "updateManagedAccount", [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, "updateManagedAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "retrieveManagedAccount", [_dec9], Object.getOwnPropertyDescriptor(_class.prototype, "retrieveManagedAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "deleteManagedAccount", [_dec10], Object.getOwnPropertyDescriptor(_class.prototype, "deleteManagedAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "listManagedAccount", [_dec11], Object.getOwnPropertyDescriptor(_class.prototype, "listManagedAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createExternalAccount", [_dec12], Object.getOwnPropertyDescriptor(_class.prototype, "createExternalAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "updateExternalAccount", [_dec13], Object.getOwnPropertyDescriptor(_class.prototype, "updateExternalAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "retrieveExternalAccount", [_dec14], Object.getOwnPropertyDescriptor(_class.prototype, "retrieveExternalAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "deleteExternalAccount", [_dec15], Object.getOwnPropertyDescriptor(_class.prototype, "deleteExternalAccount"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "transferCreate", [_dec16], Object.getOwnPropertyDescriptor(_class.prototype, "transferCreate"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "transferList", [_dec17], Object.getOwnPropertyDescriptor(_class.prototype, "transferList"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "transactionsList", [_dec18], Object.getOwnPropertyDescriptor(_class.prototype, "transactionsList"), _class.prototype)), _class))();