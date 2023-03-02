/// <reference types="node" />
import type { LoggingOptions as ClientLoggingOptions, MonitoredResource, ServiceContext, SeverityNames } from "@google-cloud/logging";
import type { LogOptions } from "@google-cloud/logging/build/src/log";
import type { LogSyncOptions } from "@google-cloud/logging/build/src/log-sync";
/**
 * Options that inherit from pino. Those options need to match with pino options
 * in order for the transport pick up the correct values for transporting.
 */
interface PinoOptions {
    /**
     * pino option messageKey. This is used to extract the message from the pino's log object
     * @default 'msg'
     */
    messageKey?: string;
    /**
     * pino option errorKey. This is used to extract the error from the pino's log object
     * @default 'err'
     */
    errorKey?: string;
    /**
     * Key of metadata used to extract the google log metadata from the pino's log object
     * @default 'meta'
     */
    metadataKey?: string;
    /**
     * Key of httpRequest used to extract the http request from the pino's log object.
     * Note that the httpRequest field must properly validate as HttpRequest
     * proto message, or the log entry would be rejected by the API. We no do
     * validation here.
     *
     * See `HttpRequest` type from {@link https://github.com/googleapis/nodejs-logging/blob/v10.4.0/src/entry.ts#L48}
     * @default 'httpRequest'
     */
    httpRequestKey?: string;
}
/**
 * Default metadata to be used for logging. See LogEntry.
 * Each logged object can have its own metadata and will be merged with default metadata
 */
export interface DefaultMetadata {
    /**
     * The name of the log that will receive messages written to this transport.
     */
    logName: string;
    /**
     * The monitored resource that the transport corresponds to. On Google Cloud
     * Platform, this is detected automatically, but you may optionally specify a
     * specific monitored resource. For more information see the
     * [official documentation]{@link
     * https://cloud.google.com/logging/docs/api/reference/rest/v2/MonitoredResource}.
     */
    resource: MonitoredResource;
    /**
     * Default log entry labels.
     */
    labels: {
        [key: string]: string;
    };
}
export interface GoogleLoggingTransportOptions extends PinoOptions, Partial<DefaultMetadata> {
    /**
     * Boolen flag that opts-in redirecting the output to STDOUT instead of ingesting logs to Cloud
     * Logging using Logging API. Defaults to {@code false}. Redirecting logs can be used in
     * Google Cloud environments with installed logging agent to delegate log ingestions to the
     * agent. Redirected logs are formatted as one line Json string following the structured logging guidelines.
     */
    redirectToStdout?: boolean;
    /**
     * For logged errors, the transport will add `serviceContext` as the service context into the metadata. For more
     * information see [this guide]{@link
     * https://cloud.google.com/error-reporting/docs/formatting-error-messages}
     * and the [official documentation]{@link
     * https://cloud.google.com/error-reporting/reference/rest/v1beta1/ServiceContext}.
     */
    serviceContext?: ServiceContext;
    /**
     * Options for `@google-cloud/logging/Logging` to pass to constructor
     */
    clientLoggingOptions?: ClientLoggingOptions;
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
    cloudLogOptions?: LogOptions | LogSyncOptions;
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
    pinoLevelSeverity?: Record<string | number, SeverityNames>;
}
export default function (opts: GoogleLoggingTransportOptions): Promise<import("stream").Transform & import("pino-abstract-transport").OnUnknown>;
export {};
//# sourceMappingURL=index.d.ts.map