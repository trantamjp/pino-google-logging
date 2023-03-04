import { Static, Type } from "@sinclair/typebox";

/**
 * Log entry data key to allow users to indicate a trace for the request.
 */
export const LOGGING_TRACE_KEY = "logging.googleapis.com/trace";

/**
 * Log entry data key to allow users to indicate a spanId for the request.
 */
export const LOGGING_SPAN_KEY = "logging.googleapis.com/spanId";

/**
 * Log entry data key to allow users to indicate a traceSampled flag for the request.
 */
export const LOGGING_SAMPLED_KEY = "logging.googleapis.com/trace_sampled";

/**
 * Options that inherit from pino. Those options need to match with pino options
 * in order for the transport pick up the correct values for transporting.
 */
const PinoOptions = Type.Object({
  /**
   * pino option messageKey. This is used to extract the message from the pino's log object
   * @default 'msg'
   */
  messageKey: Type.Optional(Type.String()),

  /**
   * pino option errorKey. This is used to extract the error from the pino's log object
   * @default 'err'
   */
  errorKey: Type.Optional(Type.String()),

  /**
   * Key of metadata used to extract the google log metadata from the pino's log object
   * @default 'meta'
   */
  metadataKey: Type.Optional(Type.String()),

  /**
   * Key of httpRequest used to extract the http request from the pino's log object.
   * Note that the httpRequest field must properly validate as HttpRequest
   * proto message, or the log entry would be rejected by the API. We no do
   * validation here.
   *
   * See `HttpRequest` type from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/entry.ts#L48}
   * @default 'httpRequest'
   */
  httpRequestKey: Type.Optional(Type.String()),
});

/**
 * Default metadata to be used for logging. See LogEntry.
 * Each logged object can have its own metadata and will be merged with default metadata.
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/utils/log-common.ts#L31}
 */
const MonitoredResource = Type.Object({
  type: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  labels: Type.Optional(
    Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])
  ),
});

/**
 * Default metadata to be used for logging. See LogEntry.
 * Each logged object can have its own metadata and will be merged with default metadata
 */
const DefaultMetadata = Type.Object({
  /**
   * The name of the log that will receive messages written to this transport.
   */
  logName: Type.Optional(Type.String()),

  /**
   * The monitored resource that the transport corresponds to. On Google Cloud
   * Platform, this is detected automatically, but you may optionally specify a
   * specific monitored resource. For more information see the
   * [official documentation]{@link
   * https://cloud.google.com/logging/docs/api/reference/rest/v2/MonitoredResource}.
   */
  resource: Type.Optional(MonitoredResource),

  /**
   * Default log entry labels.
   */
  labels: Type.Optional(Type.Record(Type.String(), Type.String())),
});
export type DefaultMetadata = Static<typeof DefaultMetadata>;

const SeverityNames = Type.Union(
  [
    "emergency",
    "alert",
    "critical",
    "error",
    "warning",
    "notice",
    "info",
    "debug",
  ].map((severity) => Type.Literal(severity))
);

/**
 * Service context for logged errors
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/index.ts#L185}
 */
const ServiceContext = Type.Object({
  service: Type.Optional(Type.String()),
  version: Type.Optional(Type.String()),
});

const CredentialBody = Type.Object({
  client_email: Type.Optional(Type.String()),
  private_key: Type.Optional(Type.String()),
});
const GoogleAuthOptions = Type.Object({
  keyFilename: Type.Optional(Type.String()),
  credentials: Type.Optional(CredentialBody),
  scopes: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  projectId: Type.Optional(Type.String()),
});
const GrpcClientOptions = Type.Intersect([GoogleAuthOptions]);
const ClientLoggingOptions = Type.Intersect([
  GrpcClientOptions,
  Type.Object({
    autoRetry: Type.Optional(Type.Boolean()),
    maxRetries: Type.Optional(Type.Number()),
    apiEndpoint: Type.Optional(Type.String()),
  }),
]);

/**
 * Log option
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/log.ts#L59}
 */
const LogOptions = Type.Object({
  removeCircular: Type.Optional(Type.Boolean()),
  maxEntrySize: Type.Optional(Type.Number()),
  jsonFieldsToTruncate: Type.Optional(Type.Array(Type.String())),
  partialSuccess: Type.Optional(Type.Boolean()),
});

/**
 * LogSync option
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/log-sync.ts#L33}
 */
const LogSyncOptions = Type.Object({
  useMessageField: Type.Optional(Type.Boolean()),
});

export const GoogleLoggingTransportOptions = Type.Intersect([
  PinoOptions,
  DefaultMetadata,
  Type.Object({
    /**
     * Boolen flag that opts-in redirecting the output to STDOUT instead of ingesting logs to Cloud
     * Logging using Logging API. Defaults to {@code false}. Redirecting logs can be used in
     * Google Cloud environments with installed logging agent to delegate log ingestions to the
     * agent. Redirected logs are formatted as one line Json string following the structured logging guidelines.
     */
    redirectToStdout: Type.Optional(Type.Boolean()),

    /**
     * For logged errors, the transport will add `serviceContext` as the service context into the metadata. For more
     * information see [this guide]{@link
     * https://cloud.google.com/error-reporting/docs/formatting-error-messages}
     * and the [official documentation]{@link
     * https://cloud.google.com/error-reporting/reference/rest/v1beta1/ServiceContext}.
     */
    serviceContext: Type.Optional(ServiceContext),

    /**
     * Options to pass to `@google-cloud/logging/Logging` constructor
     */
    clientLoggingOptions: Type.Optional(ClientLoggingOptions),

    /**
     * Option to be passed to `@google-cloud/logging/Log` when {@link GoogleLoggingTransportOptions#redirectToStdout} is in used
     * or `@google-cloud/logging/Log` otherwise.
     *
     * See `LogOptions` from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/log.ts#L59}
     * and `LogSyncOptions` from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/log-sync.ts#L33}
     *
     * The default value for `LogOptions` is
     * ```ts
     * {
     *      removeCircular: true,
     *      maxEntrySize: 250000
     * }
     * ```
     * and for `LogSyncOptions` is
     * ```ts
     * {
     *      useMessageField: true,
     * }
     * ```
     */
    cloudLogOptions: Type.Optional(Type.Union([LogOptions, LogSyncOptions])),

    /**
     * Custom mapping for pino level to Google logging severity.
     * Use tenths number (10, 20, etc..) as a key if pino outputs level as a number.
     * The transport will round down to tenths before mapping to severity using this mapping.
     *
     * This will be merged with the default mapping as follow:
     * ```ts
     * const DEFAULT_SEVERITY_MAP = {
     *   10: 'debug',
     *   trace: 'debug',
     *   20: 'debug',
     *   debug: 'debug',
     *   30: 'info',
     *   info: 'info',
     *   40: 'warning',
     *   warn: 'warning',
     *   50: 'error',
     *   error: 'error',
     *   60: 'critical',
     *   fatal: 'critical',
     * };
     * ```
     */
    pinoLevelSeverity: Type.Optional(
      Type.Union([
        Type.Record(Type.String(), SeverityNames),
        Type.Record(Type.Number(), SeverityNames),
      ])
    ),
  }),
]);
export type GoogleLoggingTransportOptions = Static<
  typeof GoogleLoggingTransportOptions
>;

export type LogObject = {
  level?: string | number; // number preferred. metadata.severity is populated from this value
  time?: string | number; // number preferred. Will be promoted to metadata.timestamp

  [x: string]: unknown;
};
