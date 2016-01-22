"use strict";

import q from "q";
import mailgun from "nodemailer-mailgun-transport";
import nodemailer from "nodemailer";
import {decorate, override} from "core-decorators";
import {promise} from "./utils/decorators";
import Debuggable from "./utils/debuggable";


export default new class MailgunAPI extends Debuggable {

	static key = "MAILGUN_API";

	@override
	getClient() {
		return nodemailer.createTransport(mailgun({auth: this.config}));
	}

	@decorate(promise)
	sendMail(message) {
		return q.nfcall(::this.client.sendMail, Object.assign(message.toObject(), {from: this.config.from}));
	}
};
