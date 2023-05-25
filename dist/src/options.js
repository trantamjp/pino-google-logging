"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleLoggingTransportOptions = exports.LOGGING_SAMPLED_KEY = exports.LOGGING_SPAN_KEY = exports.LOGGING_TRACE_KEY = void 0;
const typebox_1 = require("@sinclair/typebox");
/**
 * Log entry data key to allow users to indicate a trace for the request.
 */
exports.LOGGING_TRACE_KEY = "logging.googleapis.com/trace";
/**
 * Log entry data key to allow users to indicate a spanId for the request.
 */
exports.LOGGING_SPAN_KEY = "logging.googleapis.com/spanId";
/**
 * Log entry data key to allow users to indicate a traceSampled flag for the request.
 */
exports.LOGGING_SAMPLED_KEY = "logging.googleapis.com/trace_sampled";
/**
 * Options that inherit from pino. Those options need to match with pino options
 * in order for the transport pick up the correct values for transporting.
 */
const PinoOptions = typebox_1.Type.Object({
    /**
     * pino option messageKey. This is used to extract the message from the pino's log object
     * @default 'msg'
     */
    messageKey: typebox_1.Type.Optional(typebox_1.Type.String()),
    /**
     * pino option errorKey. This is used to extract the error from the pino's log object
     * @default 'err'
     */
    errorKey: typebox_1.Type.Optional(typebox_1.Type.String()),
    /**
     * Key of metadata used to extract the google log metadata from the pino's log object
     * @default 'meta'
     */
    metadataKey: typebox_1.Type.Optional(typebox_1.Type.String()),
    /**
     * Key of httpRequest used to extract the http request from the pino's log object.
     * Note that the httpRequest field must properly validate as HttpRequest
     * proto message, or the log entry would be rejected by the API. We no do
     * validation here.
     *
     * See `HttpRequest` type from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/entry.ts#L48}
     * @default 'httpRequest'
     */
    httpRequestKey: typebox_1.Type.Optional(typebox_1.Type.String()),
});
/**
 * Options for flushing log.
 */
const FlushLogsOptions = typebox_1.Type.Object({
    flushCheckIntervalMs: typebox_1.Type.Optional(typebox_1.Type.Number()),
    flushTimeoutMs: typebox_1.Type.Optional(typebox_1.Type.Number()),
});
/**
 * Default metadata to be used for logging. See LogEntry.
 * Each logged object can have its own metadata and will be merged with default metadata.
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/utils/log-common.ts#L31}
 */
const MonitoredResource = typebox_1.Type.Object({
    type: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.String(), typebox_1.Type.Null()])),
    labels: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.String()), typebox_1.Type.Null()])),
});
/**
 * Default metadata to be used for logging. See LogEntry.
 * Each logged object can have its own metadata and will be merged with default metadata
 */
const DefaultMetadata = typebox_1.Type.Object({
    /**
     * The name of the log that will receive messages written to this transport.
     */
    logName: typebox_1.Type.Optional(typebox_1.Type.String()),
    /**
     * The monitored resource that the transport corresponds to. On Google Cloud
     * Platform, this is detected automatically, but you may optionally specify a
     * specific monitored resource. For more information see the
     * [official documentation]{@link
     * https://cloud.google.com/logging/docs/api/reference/rest/v2/MonitoredResource}.
     */
    resource: typebox_1.Type.Optional(MonitoredResource),
    /**
     * Default log entry labels.
     */
    labels: typebox_1.Type.Optional(typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.String())),
});
const SeverityNames = typebox_1.Type.Union([
    "emergency",
    "alert",
    "critical",
    "error",
    "warning",
    "notice",
    "info",
    "debug",
].map((severity) => typebox_1.Type.Literal(severity)));
/**
 * Service context for logged errors
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/index.ts#L185}
 */
const ServiceContext = typebox_1.Type.Object({
    service: typebox_1.Type.Optional(typebox_1.Type.String()),
    version: typebox_1.Type.Optional(typebox_1.Type.String()),
});
const CredentialBody = typebox_1.Type.Object({
    client_email: typebox_1.Type.Optional(typebox_1.Type.String()),
    private_key: typebox_1.Type.Optional(typebox_1.Type.String()),
});
const GoogleAuthOptions = typebox_1.Type.Object({
    keyFilename: typebox_1.Type.Optional(typebox_1.Type.String()),
    credentials: typebox_1.Type.Optional(CredentialBody),
    scopes: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.String(), typebox_1.Type.Array(typebox_1.Type.String())])),
    projectId: typebox_1.Type.Optional(typebox_1.Type.String()),
});
const GrpcClientOptions = typebox_1.Type.Intersect([GoogleAuthOptions]);
const ClientLoggingOptions = typebox_1.Type.Intersect([
    GrpcClientOptions,
    typebox_1.Type.Object({
        autoRetry: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
        maxRetries: typebox_1.Type.Optional(typebox_1.Type.Number()),
        apiEndpoint: typebox_1.Type.Optional(typebox_1.Type.String()),
    }),
]);
/**
 * Log option
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/log.ts#L59}
 */
const LogOptions = typebox_1.Type.Object({
    removeCircular: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    maxEntrySize: typebox_1.Type.Optional(typebox_1.Type.Number()),
    jsonFieldsToTruncate: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String())),
    partialSuccess: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
});
/**
 * LogSync option
 * See {@link https://github.com/googleapis/nodejs-logging/blob/main/src/log-sync.ts#L33}
 */
const LogSyncOptions = typebox_1.Type.Object({
    useMessageField: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
});
exports.GoogleLoggingTransportOptions = typebox_1.Type.Intersect([
    PinoOptions,
    FlushLogsOptions,
    DefaultMetadata,
    typebox_1.Type.Object({
        /**
         * Boolen flag that opts-in redirecting the output to STDOUT instead of ingesting logs to Cloud
         * Logging using Logging API. Defaults to {@code false}. Redirecting logs can be used in
         * Google Cloud environments with installed logging agent to delegate log ingestions to the
         * agent. Redirected logs are formatted as one line Json string following the structured logging guidelines.
         */
        redirectToStdout: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
        /**
         * For logged errors, the transport will add `serviceContext` as the service context into the metadata. For more
         * information see [this guide]{@link
         * https://cloud.google.com/error-reporting/docs/formatting-error-messages}
         * and the [official documentation]{@link
         * https://cloud.google.com/error-reporting/reference/rest/v1beta1/ServiceContext}.
         */
        serviceContext: typebox_1.Type.Optional(ServiceContext),
        /**
         * Options to pass to `@google-cloud/logging/Logging` constructor
         */
        clientLoggingOptions: typebox_1.Type.Optional(ClientLoggingOptions),
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
        cloudLogOptions: typebox_1.Type.Optional(typebox_1.Type.Union([LogOptions, LogSyncOptions])),
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
        pinoLevelSeverity: typebox_1.Type.Optional(typebox_1.Type.Union([
            typebox_1.Type.Record(typebox_1.Type.String(), SeverityNames),
            typebox_1.Type.Record(typebox_1.Type.Number(), SeverityNames),
        ])),
    }),
]);
//# sourceMappingURL=options.js.map