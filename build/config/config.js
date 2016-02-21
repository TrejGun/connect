"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = _defineProperty({}, process.env.NODE_ENV, {
	aws: {
		s3: {
			bucket: process.env.AWS_S3_BUCKET,
			// the DNS entry for the CNAME alias of our S3 bucket
			url: process.env.AWS_S3_URL,
			region: process.env.AWS_S3_REGION,
			s3Options: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
			}
		}
	},
	google: {
		service: {
			email: process.env.GOOGLE_SERVICE_EMAIL,
			keyFile: process.env.GOOGLE_SERVICE_KEYFILE,
			permissions: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.readonly"]
		}
	},
	stripe: {
		publicKey: process.env.STRIPE_PUBLIC_KEY,
		privateKey: process.env.STRIPE_PRIVATE_KEY
	},
	mailgun: {
		api_key: process.env.MAILGUN_APIKEY, // eslint-disable-line camelcase
		domain: process.env.MAILGUN_DOMAIN,
		from: "Adventure Bucket List <no-reply@adventurebucketlist.com>"
	},
	twilio: {
		AccountSID: process.env.TWILIO_ACCOUNT_SID,
		AuthToken: process.env.TWILIO_AUTH_TOKEN,
		from: process.env.TWILIO_NUMBER
	}
});