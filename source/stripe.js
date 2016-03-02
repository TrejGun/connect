"use strict";

import fs from "fs";
import stripe from "stripe";
import {decorate, override} from "core-decorators";
import {getCurrency} from "./utils/utils";
import {promise, payment} from "./utils/decorators";
import Debuggable from "./utils/debuggable";


export default new class StripeAPI extends Debuggable {

	static key = "STRIPE_API";

	@override
	getClient() {
		return stripe(this.config.privateKey);
	}

	// CHARGE

	@decorate(promise)
	@decorate(payment)
	chargesCreate(user, data, options) {
		return stripe(user.payment.privateKey).charges.create(data, options);
	}

	@decorate(promise)
	chargesRetrieve(user, data) {
		return stripe(user.payment.privateKey).charges.retrieve(data);
	}

	@decorate(promise)
	chargesList(user, data) {
		return stripe(user.payment.privateKey).charges.list(data);
	}

	// REFUND

	@decorate(promise)
	@decorate(payment)
	refundsCreate(user, data) {
		return stripe(user.payment.privateKey).refunds.create(data);
	}

	// MANAGED ACCOUNT

	@decorate(promise)
	createManagedAccount(user, data) {
		return this.client.accounts.create({
			managed: true,
			country: data.country,
			email: user.email,
			business_name: user.companyName, // eslint-disable-line camelcase
			business_url: user.domainName, // eslint-disable-line camelcase
			debit_negative_balances: true, // eslint-disable-line camelcase
			default_currency: getCurrency(user), // eslint-disable-line camelcase
			statement_descriptor: user.companyName.substring(0, 22), // eslint-disable-line camelcase
			tos_acceptance: { // eslint-disable-line camelcase
				date: Math.round(Date.now() / 1000),
				ip: data.ip,
				user_agent: data.ua // eslint-disable-line camelcase
			},
			transfer_schedule: { // eslint-disable-line camelcase
				delay_days: 7, // eslint-disable-line camelcase
				interval: "daily" // eslint-disable-line camelcase
			}
		});
	}

	@decorate(promise)
	updateManagedAccount(user, data) {
		return this.client.accounts.update(user.payment.account, data);
	}

	@decorate(promise)
	retrieveManagedAccount(user) {
		return this.client.accounts.retrieve(user.payment.account);
	}

	@decorate(promise)
	deleteManagedAccount(user) {
		return this.client.accounts.del(user.payment.account);
	}

	@decorate(promise)
	listManagedAccount() {
		return this.client.accounts.list({
			limit: 100
		});
	}

	// EXTERNAL ACCOUNT

	@decorate(promise)
	createExternalAccount(user, data) {
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

	@decorate(promise)
	updateExternalAccount(user, data) {
		return this.client.accounts.updateExternalAccount(user.payment.account, data.bankAccountId, {
			default_for_currency: data.default_for_currency // eslint-disable-line camelcase
		});
	}

	@decorate(promise)
	retrieveExternalAccount(user, data) {
		return this.client.accounts.retrieveBank_account(user.payment.account, data.bankAccountId);
	}

	@decorate(promise)
	deleteExternalAccount(user, data) {
		return this.client.accounts.deleteExternalAccount(user.payment.account, data.bankAccountId);
	}

	// TRANSFER

	@decorate(promise)
	transfersList(user, data) {
		return stripe(user.payment.privateKey).transfers.list(data);
	}

	// BALANCE

	@decorate(promise)
	transactionsList(user, data) {
		return stripe(user.payment.privateKey).balance.listTransactions(data);
	}

	// TOKEN

	@decorate(promise)
	tokenCreate(data) {
		return this.client.tokens.create(data);
	}

	// FILE UPLOAD

	fileUploads(user, data) {
		return this.client.fileUploads.create({
				purpose: "identity_document",
				file: {
					data: fs.readFileSync(data.image.path),
					name: "image.jpg",
					type: "application/octet-stream"
				}
			}, {
				stripe_account: user.payment.account // eslint-disable-line camelcase
			})
			.then(file =>
				this.client.accounts.update(user.payment.account, {
					legal_entity: { // eslint-disable-line camelcase
						verification: {
							document: file.id
						}
					}
				})
			);
	}
};
