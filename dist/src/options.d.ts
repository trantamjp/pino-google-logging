import { Static } from "@sinclair/typebox";
/**
 * Log entry data key to allow users to indicate a trace for the request.
 */
export declare const LOGGING_TRACE_KEY = "logging.googleapis.com/trace";
/**
 * Log entry data key to allow users to indicate a spanId for the request.
 */
export declare const LOGGING_SPAN_KEY = "logging.googleapis.com/spanId";
/**
 * Log entry data key to allow users to indicate a traceSampled flag for the request.
 */
export declare const LOGGING_SAMPLED_KEY = "logging.googleapis.com/trace_sampled";
/**
 * Default metadata to be used for logging. See LogEntry.
 * Each logged object can have its own metadata and will be merged with default metadata
 */
declare const DefaultMetadata: import("@sinclair/typebox").TObject<{
    /**
     * The name of the log that will receive messages written to this transport.
     */
    logName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /**
     * The monitored resource that the transport corresponds to. On Google Cloud
     * Platform, this is detected automatically, but you may optionally specify a
     * specific monitored resource. For more information see the
     * [official documentation]{@link
     * https://cloud.google.com/logging/docs/api/reference/rest/v2/MonitoredResource}.
     */
    resource: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        labels: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TString>, import("@sinclair/typebox").TNull]>>;
    }>>;
    /**
     * Default log entry labels.
     */
    labels: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TString>>;
}>;
export type DefaultMetadata = Static<typeof DefaultMetadata>;
export declare const GoogleLoggingTransportOptions: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    /**
     * pino option messageKey. This is used to extract the message from the pino's log object
     * @default 'msg'
     */
    messageKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /**
     * pino option errorKey. This is used to extract the error from the pino's log object
     * @default 'err'
     */
    errorKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /**
     * Key of metadata used to extract the google log metadata from the pino's log object
     * @default 'meta'
     */
    metadataKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /**
     * Key of httpRequest used to extract the http request from the pino's log object.
     * Note that the httpRequest field must properly validate as HttpRequest
     * proto message, or the log entry would be rejected by the API. We no do
     * validation here.
     *
     * See `HttpRequest` type from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/entry.ts#L48}
     * @default 'httpRequest'
     */
    httpRequestKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>, import("@sinclair/typebox").TObject<{
    flushCheckIntervalMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    flushTimeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, import("@sinclair/typebox").TObject<{
    /**
     * The name of the log that will receive messages written to this transport.
     */
    logName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /**
     * The monitored resource that the transport corresponds to. On Google Cloud
     * Platform, this is detected automatically, but you may optionally specify a
     * specific monitored resource. For more information see the
     * [official documentation]{@link
     * https://cloud.google.com/logging/docs/api/reference/rest/v2/MonitoredResource}.
     */
    resource: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        labels: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TString>, import("@sinclair/typebox").TNull]>>;
    }>>;
    /**
     * Default log entry labels.
     */
    labels: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TString>>;
}>, import("@sinclair/typebox").TObject<{
    /**
     * Boolen flag that opts-in redirecting the output to STDOUT instead of ingesting logs to Cloud
     * Logging using Logging API. Defaults to {@code false}. Redirecting logs can be used in
     * Google Cloud environments with installed logging agent to delegate log ingestions to the
     * agent. Redirected logs are formatted as one line Json string following the structured logging guidelines.
     */
    redirectToStdout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    /**
     * For logged errors, the transport will add `serviceContext` as the service context into the metadata. For more
     * information see [this guide]{@link
     * https://cloud.google.com/error-reporting/docs/formatting-error-messages}
     * and the [official documentation]{@link
     * https://cloud.google.com/error-reporting/reference/rest/v1beta1/ServiceContext}.
     */
    serviceContext: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        service: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    /**
     * Options to pass to `@google-cloud/logging/Logging` constructor
     */
    clientLoggingOptions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        keyFilename: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        credentials: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            client_email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            private_key: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
        scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>]>>;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>, import("@sinclair/typebox").TObject<{
        autoRetry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        maxRetries: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        apiEndpoint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>]>>;
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
    cloudLogOptions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        removeCircular: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        maxEntrySize: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        jsonFieldsToTruncate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        partialSuccess: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>, import("@sinclair/typebox").TObject<{
        useMessageField: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>]>>;
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
    pinoLevelSeverity: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnion<import("@sinclair/typebox").TLiteral<string>[]>>, import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TUnion<import("@sinclair/typebox").TLiteral<string>[]>>]>>;
}>]>;
export type GoogleLoggingTransportOptions = Static<typeof GoogleLoggingTransportOptions>;
export type LogObject = {
    level?: string | number;
    time?: string | number;
    [x: string]: unknown;
};
export {};
//# sourceMappingURL=options.d.ts.map