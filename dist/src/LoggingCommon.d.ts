import { DefaultMetadata, GoogleLoggingTransportOptions, LogObject } from "./options";
import { Entry } from "@google-cloud/logging";
import type { LogEntry } from "@google-cloud/logging/build/src/entry";
import type { SeverityNames } from "@google-cloud/logging/build/src/utils/log-common";
import Bottleneck from "bottleneck";
/**
 * Default severity mapping from pino levels
 */
export declare const DEFAULT_SEVERITY_MAP: Record<string | number, SeverityNames>;
export declare class LoggingCommon {
    #private;
    readonly defaultMetadata: Required<DefaultMetadata>;
    bottleneck: Bottleneck;
    static readonly LOGGING_TRACE_KEY = "logging.googleapis.com/trace";
    static readonly LOGGING_SPAN_KEY = "logging.googleapis.com/spanId";
    static readonly LOGGING_SAMPLED_KEY = "logging.googleapis.com/trace_sampled";
    constructor(options: GoogleLoggingTransportOptions);
    protected mapSeverity(logLevel?: string | number): "emergency" | "alert" | "critical" | "error" | "warning" | "notice" | "info" | "debug" | "default";
    init(): Promise<void>;
    private get cloudLog();
    log(obj: LogObject): Promise<void>;
    entry(metadata?: LogEntry, data?: string | object): Entry;
    flush(): Promise<void>;
}
//# sourceMappingURL=LoggingCommon.d.ts.map