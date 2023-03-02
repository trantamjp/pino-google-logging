import type { DefaultMetadata, GoogleLoggingTransportOptions } from ".";
import { Entry } from "@google-cloud/logging";
import type { LogEntry } from "@google-cloud/logging/build/src/entry";
import type { SeverityNames } from "@google-cloud/logging/build/src/utils/log-common";
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
 * Default severity mapping from pino levels
 */
export declare const DEFAULT_SEVERITY_MAP: Record<string | number, SeverityNames>;
export type LogObject = {
    level?: string | number;
    time?: string | number;
    [x: string]: unknown;
};
export declare class LoggingCommon {
    #private;
    readonly defaultMetadata: DefaultMetadata;
    static readonly LOGGING_TRACE_KEY = "logging.googleapis.com/trace";
    static readonly LOGGING_SPAN_KEY = "logging.googleapis.com/spanId";
    static readonly LOGGING_SAMPLED_KEY = "logging.googleapis.com/trace_sampled";
    constructor(options: GoogleLoggingTransportOptions);
    protected mapSeverity(logLevel: string | number): SeverityNames;
    init(): Promise<void>;
    private get cloudLog();
    log(obj: LogObject): Promise<void>;
    entry(metadata?: LogEntry, data?: string | object): Entry;
}
//# sourceMappingURL=LoggingCommon.d.ts.map