import {
  DefaultMetadata,
  GoogleLoggingTransportOptions,
  LOGGING_SAMPLED_KEY,
  LOGGING_SPAN_KEY,
  LOGGING_TRACE_KEY,
  LogObject,
} from "@/options";
import {
  Entry,
  HttpRequest,
  Log,
  LogSync,
  Logging,
  LoggingOptions,
  ServiceContext,
} from "@google-cloud/logging";
import type { LogEntry } from "@google-cloud/logging/build/src/entry";
import type { LogOptions } from "@google-cloud/logging/build/src/log";
import type { LogSyncOptions } from "@google-cloud/logging/build/src/log-sync";
import type { SeverityNames } from "@google-cloud/logging/build/src/utils/log-common";
import type { StackdriverTracer } from "@google-cloud/trace-agent/build/src/trace-api";

/**
 * Default severity mapping from pino levels
 */
export const DEFAULT_SEVERITY_MAP: Record<string | number, SeverityNames> = {
  10: "debug",
  trace: "debug",
  20: "debug",
  debug: "debug",
  30: "info",
  info: "info",
  40: "warning",
  warn: "warning",
  50: "error",
  error: "error",
  60: "critical",
  fatal: "critical",
};

const DEFAULT_LOGGING_LOG_OPTIONS: LogOptions = {
  removeCircular: true,
  // See: https://cloud.google.com/logging/quotas, a log size of
  // 250,000 has been chosen to keep us comfortably within the
  // 256,000 limit.
  maxEntrySize: 250000,
};

const DEFAULT_LOGGING_LOGSYNC_OPTIONS: LogSyncOptions = {
  useMessageField: true,
};

/*!
 * Gets the current fully qualified trace ID when available from the
 * @google-cloud/trace-agent library in the LogEntry.trace field format of:
 * "projects/[PROJECT-ID]/traces/[TRACE-ID]".
 */
function getCurrentTraceFromAgent(): string | null {
  // @ts-expect-error no type
  const agent = global._google_trace_agent as StackdriverTracer;
  if (!agent || !agent.getCurrentContextId || !agent.getWriterProjectId) {
    return null;
  }

  const traceId = agent.getCurrentContextId();
  if (!traceId) {
    return null;
  }

  const traceProjectId = agent.getWriterProjectId();
  if (!traceProjectId) {
    return null;
  }

  return `projects/${traceProjectId}/traces/${traceId}`;
}

export class LoggingCommon {
  readonly defaultMetadata: Required<DefaultMetadata>;

  #clientLoggingOptions: LoggingOptions;
  #cloudLog?: Log | LogSync;
  #cloudLogOptions: LogSyncOptions & LogOptions;

  #errorKey: string;
  #httpRequestKey: string;
  #messageKey: string;
  #metadataKey: string;
  #redirectToStdout: boolean;
  #serviceContext?: ServiceContext;
  #severityMap: Record<string | number, SeverityNames>;

  // LOGGING_TRACE_KEY is Cloud Logging specific and has the format:
  // logging.googleapis.com/trace
  static readonly LOGGING_TRACE_KEY = LOGGING_TRACE_KEY;
  // LOGGING_TRACE_KEY is Cloud Logging specific and has the format:
  // logging.googleapis.com/spanId
  static readonly LOGGING_SPAN_KEY = LOGGING_SPAN_KEY;
  // LOGGING_SAMPLED_KEY is Cloud Logging specific and has the format:
  // logging.googleapis.com/trace_sampled
  static readonly LOGGING_SAMPLED_KEY = LOGGING_SAMPLED_KEY;

  constructor(options: GoogleLoggingTransportOptions) {
    this.defaultMetadata = {
      logName: options.logName ?? "pino_log",
      resource: Object.assign({ type: "global" }, options.resource),
      labels: Object.assign(
        {},
        { logger: "pino", agent: "pino-google-logging" },
        options.labels
      ),
    };

    this.#errorKey = options.errorKey ?? "err";
    this.#httpRequestKey = options.httpRequestKey ?? "httpRequest";
    this.#messageKey = options.messageKey ?? "msg";
    this.#metadataKey = options.metadataKey ?? "metadata";
    this.#redirectToStdout = options.redirectToStdout ?? false;
    this.#serviceContext = options.serviceContext;
    this.#severityMap = Object.assign(
      {},
      DEFAULT_SEVERITY_MAP,
      options.pinoLevelSeverity
    );

    this.#clientLoggingOptions = Object.assign(
      {},
      {
        scopes: ["https://www.googleapis.com/auth/logging.write"],
      },
      options
    );

    if (!this.#redirectToStdout) {
      this.#cloudLogOptions = Object.assign(
        DEFAULT_LOGGING_LOG_OPTIONS,
        options.cloudLogOptions
      );
    } else {
      this.#cloudLogOptions = Object.assign(
        DEFAULT_LOGGING_LOGSYNC_OPTIONS,
        options.cloudLogOptions
      );
    }
  }

  protected mapSeverity(logLevel: string | number): SeverityNames {
    if (typeof logLevel == "number") {
      logLevel = ~~(logLevel / 10) * 10; // round down to tenth
      if (logLevel < 10) logLevel = 10;
      else if (logLevel > 60) logLevel = 60;
    }
    const severity = this.#severityMap[logLevel] ?? "info";
    return severity;
  }

  async init() {
    const clientLogging = new Logging(this.#clientLoggingOptions);

    if (!this.#redirectToStdout) {
      await clientLogging.setProjectId();
      await clientLogging.setDetectedResource();

      this.#cloudLog = clientLogging.log(
        this.defaultMetadata.logName,
        this.#cloudLogOptions
      );
    } else {
      this.#cloudLog = clientLogging.logSync(
        this.defaultMetadata.logName,
        undefined,
        this.#cloudLogOptions
      );
    }
  }

  // expose this instead of sharp notation so we can run test
  private get cloudLog() {
    return this.#cloudLog;
  }

  async log(obj: LogObject) {
    if (!this.cloudLog) throw new Error("Transport not init() yet");

    const metadata =
      typeof obj[this.#metadataKey] === "object"
        ? (obj[this.#metadataKey] as LogEntry)
        : {};
    delete obj[this.#metadataKey];

    // Google logging use `message` key as message body
    // Move it to `message` if pino uses different one
    if (this.#messageKey && this.#messageKey != "message") {
      obj["message"] = obj[this.#messageKey];
      delete obj[this.#messageKey];
    }

    const entryMetadata: LogEntry = {
      ...metadata,
      labels: Object.assign({}, this.defaultMetadata.labels, metadata.labels),
      resource: Object.assign(
        {},
        this.defaultMetadata.resource,
        metadata.resource
      ),
      severity: this.mapSeverity(obj["level"] ?? "info"),
    };

    // Attach serviceContext if there is an error from payload
    if (obj[this.#errorKey] && this.#serviceContext)
      obj["serviceContext"] = this.#serviceContext;

    // If the obj contains a httpRequest property, promote it to the
    // entry metadata. This allows Cloud Logging to use request log formatting.
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#HttpRequest
    // Note that the httpRequest field must properly validate as HttpRequest
    // proto message, or the log entry would be rejected by the API. We no do
    // validation here.
    if (
      obj[this.#httpRequestKey] &&
      typeof obj[this.#httpRequestKey] === "object"
    ) {
      entryMetadata.httpRequest = obj[this.#httpRequestKey] as HttpRequest;
      delete obj[this.#httpRequestKey];
    }

    // If the logging obj contains a time property, promote it to the entry
    // metadata
    if (obj.time) {
      entryMetadata.timestamp =
        typeof obj.time === "number" ? new Date(obj.time) : obj.time;
      delete obj.time;
    }

    entryMetadata.trace = metadata.trace || getCurrentTraceFromAgent();
    entryMetadata.spanId = metadata.spanId;
    entryMetadata.traceSampled = !!metadata.traceSampled;

    const entries: Entry[] = [];
    entries.push(this.entry(entryMetadata, obj));

    if (this.cloudLog instanceof Log) {
      await this.cloudLog.write(entries);
    } else {
      this.cloudLog.write(entries);
    }
  }

  entry(metadata?: LogEntry, data?: string | object): Entry {
    if (this.#redirectToStdout) {
      return (this.cloudLog as LogSync).entry(metadata, data);
    }
    return (this.cloudLog as Log).entry(metadata, data);
  }
}
