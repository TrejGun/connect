"use strict";

import debug from "debug";
import assert from "power-assert";
import stripe from "stripe";
import {cardObject} from "abl-constants/build/objects";

import configs from "../../source/config/config";

const config = configs[process.env.NODE_ENV];
const SAPI = stripe(config.server.stripe.privateKey);

const log = debug("test:stripe");

describe("stripe API", () => {
	if (process.env.STRIPE_API !== "true") {
		log("stripe API was not tested");
		return;
	}

	let token;
	let charge;

	describe("Stripe", () => {
		it("should create token", () => {
			return SAPI.tokens.create({
					card: cardObject()
				})
				.then(result => {
					log(result);
					assert.equal(result.object, "token");
					token = result.id;
				});
		});

		it("should create charge", () => {
			return SAPI.charges.create({
					amount: 1000,
					source: token,
					currency: "usd",
					description: "description!"
				})
				.then(result => {
					log(result);
					assert.equal(result.object, "charge");
					charge = result.id;
				});
		});

		it("should create refund", () => {
			return SAPI.charges.createRefund(charge, {
					reason: "requested_by_customer"
				})
				.then(result => {
					log(result);
					assert.equal(result.object, "refund");
				});
		});
	});
});
