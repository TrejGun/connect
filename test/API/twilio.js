"use strict";

import assert from "power-assert";
import debug from "debug";
import TAPI from "../../source/twilio";


const log = debug("test:twilio");

describe("Twilio", () => {
	if (process.env.TWILIO_API !== "true") {
		log("Twilio API was not tested");
		return;
	}

	it("should send sms", () =>
		TAPI.sendSMS({
				to: "+6281239198760",
				body: "test!",
				toObject() {
					return this;
				}
			})
			.then(sms => {
				log(sms);
				assert(sms);
			})
	);
});
