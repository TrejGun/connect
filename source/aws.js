"use strict";

import q from "q";
import crypto from "crypto";
import url from "url";
import querystring from "querystring";
import mime from "mime";
import {decorate} from "core-decorators";
import {getRandomString} from "./utils/utils";
import {promise} from "./utils/decorators";
import Debuggable from "./utils/debuggable";


function ensureLeadingSlash(filename) {
	return filename[0] !== "/" ? `/${filename}` : filename;
}

function getEpoch(expires) {
	const date = new Date();
	date.setMinutes(date.getMinutes() + expires);
	return Math.floor(date.getTime() / 1000);
}

function hmacSha1(secret, message) {
	return crypto.createHmac("sha1", secret).update(new Buffer(message, "utf-8")).digest("base64");
}

function canonicalizeHeaders(headers) {
	const buf = [];
	const fields = Object.keys(headers);
	for (let i = 0, len = fields.length; i < len; ++i) {
		let field = fields[i];
		const val = headers[field];

		field = field.toLowerCase();

		if (field.indexOf("x-amz") !== 0 || field === "x-amz-date") {
			continue;
		}

		buf.push(`${field}:${val}`);
	}

	return buf.sort((a, b) =>
		// Headers are sorted lexigraphically based on the header name only.
		a.split(":")[0] > b.split(":")[0] && 1 || -1
	).join("\n");
}

function queryStringToSign(resource, mimeType, epoch) {
	return `PUT\n\n
		${mimeType}\n
		${epoch}\n
		${canonicalizeHeaders({"x-amz-acl": "public-read"})}\n
		${resource}
		`;
}


export default new class AWSAPI extends Debuggable {

	static key = "AWS_API";

	// THIS FUNCTION IS HALF-ASSED and only works for standard region in S3
	@decorate(promise)
	getSignedUrl(fileName, expires) {
		const fixedFileName = decodeURIComponent(decodeURIComponent(fileName));
		const signedUrl = "https://s3.amazonaws.com";
		const pathname = url.parse(fixedFileName).pathname;
		const resource = `/${this.config.s3.bucket}${ensureLeadingSlash(pathname)}`;
		const mimeType = mime.lookup(fixedFileName);
		if (["image/png", "image/jpeg"].indexOf(mimeType) === -1) {
			return q.reject({
				success: false,
				message: "Wrong mime type"
			});
		}
		const epoch = getEpoch(expires);
		const message = queryStringToSign(resource, mimeType, epoch);
		const signature = hmacSha1(this.config.s3.s3Options.secretAccessKey, message);
		const queryString = querystring.stringify({
			Expires: epoch,
			AWSAccessKeyId: this.config.s3.s3Options.accessKeyId,
			Signature: signature
		});
		return q({
			success: true,
			url: `${signedUrl}${resource}?${queryString}`,
			file: getRandomString(20),
			bucketUrl: this.config.s3.url
		});
	}
};
