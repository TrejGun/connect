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

## Configure googleapis
1. https://console.developers.google.com - create service account key for calendar and download a p12 file.
2. Use next command to convert it to pem
bash cat key.p12 | openssl pkcs12 -nodes -passin pass:notasecret | openssl rsa > key.pem
3. Use your App Engine default service account from https://console.developers.google.com/permissions/serviceaccounts for GOOGLE_SERVICE_EMAIL
4. Use your key.pem file for GOOGLE_SERVICE_KEYFILE
