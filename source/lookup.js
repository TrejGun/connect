"use strict";

import q from "q";
import Twilio from "twilio";
import {decorate, override} from "core-decorators";
import {callback} from "./utils/decorators";
import Debuggable from "./utils/debuggable";


export default new class TwilioAPI extends Debuggable {

	static key = "LOOKUP_API";

	@override
	getClient() {
		return new Twilio.LookupsClient(
			this.config.AccountSID,
			this.config.AuthToken
		);
	}

	@decorate(callback)
	checkPhoneNumber(done, user) {
		if (!(user && user.phoneNumber)) {
			user.invalidate("phoneNumber", "Phone number is required", user.phoneNumber);
			done();
			return q();
		}

		return q.nbind(this.client.phoneNumbers(user.phoneNumber).get)()
			.then(result => {
				user.set("phoneNumber", result.phone_number);
				done();
			})
			.catch(e => {
				this.log("phone validation failed", e);
				user.invalidate("phoneNumber", "Invalid phone number", user.phoneNumber);
				done();
			});
	}
};
