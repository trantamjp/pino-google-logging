# pino-google-logging

Pino transport for Google Logging

![NPM](https://img.shields.io/npm/l/pino-google-logging?style=flat-square)
![npm](https://img.shields.io/npm/v/pino-google-logging?style=flat-square)

This module provides a 'transport' for pino that sends logs to [Google Logging](https://cloud.google.com/logging).

## Install

```shell
npm i pino-google-logging
```

## Usage

```typescript
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-google-logging",
    options: {
      /**
       * pino option messageKey. This is used to extract the message from the pino's log object
       * @default 'msg'
       */
      messageKey: "msg",

      /**
       * pino option errorKey. This is used to extract the error from the pino's log object
       * @default 'err'
       */
      errorKey: "err",

      /**
       * Key of metadata used to extract the google log metadata from the pino's log object
       * @default 'meta'
       */
      metadataKey: "meta",

      /**
       * Key of httpRequest used to extract the http request from the pino's log object.
       * Note that the httpRequest field must properly validate as HttpRequest
       * proto message, or the log entry would be rejected by the API. We no do
       * validation here.
       *
       * See `HttpRequest` type from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/entry.ts#L48}
       * @default 'httpRequest'
       */
      httpRequestKey: "httpRequest",

      /**
       * Boolen flag that opts-in redirecting the output to STDOUT instead of ingesting logs to Cloud
       * Logging using Logging API. Defaults to {@code false}. Redirecting logs can be used in
       * Google Cloud environments with installed logging agent to delegate log ingestions to the
       * agent. Redirected logs are formatted as one line Json string following the structured logging guidelines.
       */
      redirectToStdout: false,
    },
  },
});

logger.debug(
  "Message will be shown up in Google Logging console with severity DEBUG"
);
logger.info("Information message with severity INFO");
```
