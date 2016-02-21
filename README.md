3rd party API's
===============

All 3rd party API's are mocked up by default
You have to enable them by passing NAME_API=true to command line

## Test

```bash
cp ./.env.sample ./env
npm run test test/api
```

## Config

All boolean, default false

* AWS_API
* GOOGLE_API
* LOOKUP_API
* MAILGUN_API
* STRIPE_API
* TWILIO_API

### AWS
* AWS_S3_BUCKET
* AWS_S3_URL
* AWS_S3_REGION
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY

### GOOGLE
* GOOGLE_SERVICE_EMAIL
* GOOGLE_SERVICE_KEYFILE

### STRIPE
* STRIPE_PUBLIC_KEY
* STRIPE_PRIVATE_KEY

### MAILGUN
* MAILGUN_APIKEY
* MAILGUN_DOMAIN

### TWILIO
* TWILIO_ACCOUNT_SID
* TWILIO_AUTH_TOKEN
* TWILIO_NUMBER