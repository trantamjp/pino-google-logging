"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _LoggingCommon_clientLoggingOptions, _LoggingCommon_cloudLog, _LoggingCommon_cloudLogOptions, _LoggingCommon_errorKey, _LoggingCommon_httpRequestKey, _LoggingCommon_messageKey, _LoggingCommon_metadataKey, _LoggingCommon_redirectToStdout, _LoggingCommon_serviceContext, _LoggingCommon_severityMap, _LoggingCommon_flushCheckIntervalMs, _LoggingCommon_flushTimeoutMs;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingCommon = exports.DEFAULT_SEVERITY_MAP = void 0;
const options_1 = require("./options");
const logging_1 = require("@google-cloud/logging");
const bottleneck_1 = __importDefault(require("bottleneck"));
/**
 * Default severity mapping from pino levels
 */
exports.DEFAULT_SEVERITY_MAP = {
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DEFAULT_LOGGING_LOG_OPTIONS = {
    removeCircular: true,
    // See: https://cloud.google.com/logging/quotas, a log size of
    // 250,000 has been chosen to keep us comfortably within the
    // 256,000 limit.
    maxEntrySize: 250000,
};
const DEFAULT_LOGGING_LOGSYNC_OPTIONS = {
    useMessageField: true,
};
/*!
 * Gets the current fully qualified trace ID when available from the
 * @google-cloud/trace-agent library in the LogEntry.trace field format of:
 * "projects/[PROJECT-ID]/traces/[TRACE-ID]".
 */
function getCurrentTraceFromAgent() {
    // @ts-expect-error no type
    const agent = global._google_trace_agent;
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
class LoggingCommon {
    constructor(options) {
        _LoggingCommon_clientLoggingOptions.set(this, void 0);
        _LoggingCommon_cloudLog.set(this, void 0);
        _LoggingCommon_cloudLogOptions.set(this, void 0);
        _LoggingCommon_errorKey.set(this, void 0);
        _LoggingCommon_httpRequestKey.set(this, void 0);
        _LoggingCommon_messageKey.set(this, void 0);
        _LoggingCommon_metadataKey.set(this, void 0);
        _LoggingCommon_redirectToStdout.set(this, void 0);
        _LoggingCommon_serviceContext.set(this, void 0);
        _LoggingCommon_severityMap.set(this, void 0);
        _LoggingCommon_flushCheckIntervalMs.set(this, void 0);
        _LoggingCommon_flushTimeoutMs.set(this, void 0);
        this.bottleneck = new bottleneck_1.default({
            maxConcurrent: 1,
        });
        this.defaultMetadata = {
            logName: options.logName ?? "pino_log",
            resource: Object.assign({ type: "global" }, options.resource),
            labels: Object.assign({}, { logger: "pino", agent: "pino-google-logging" }, options.labels),
        };
        __classPrivateFieldSet(this, _LoggingCommon_errorKey, options.errorKey ?? "err", "f");
        __classPrivateFieldSet(this, _LoggingCommon_httpRequestKey, options.httpRequestKey ?? "httpRequest", "f");
        __classPrivateFieldSet(this, _LoggingCommon_messageKey, options.messageKey ?? "msg", "f");
        __classPrivateFieldSet(this, _LoggingCommon_metadataKey, options.metadataKey ?? "metadata", "f");
        __classPrivateFieldSet(this, _LoggingCommon_redirectToStdout, options.redirectToStdout ?? false, "f");
        __classPrivateFieldSet(this, _LoggingCommon_serviceContext, options.serviceContext, "f");
        __classPrivateFieldSet(this, _LoggingCommon_severityMap, Object.assign({}, exports.DEFAULT_SEVERITY_MAP, options.pinoLevelSeverity), "f");
        __classPrivateFieldSet(this, _LoggingCommon_clientLoggingOptions, Object.assign({}, {
            scopes: ["https://www.googleapis.com/auth/logging.write"],
        }, options), "f");
        if (!__classPrivateFieldGet(this, _LoggingCommon_redirectToStdout, "f")) {
            __classPrivateFieldSet(this, _LoggingCommon_cloudLogOptions, Object.assign(DEFAULT_LOGGING_LOG_OPTIONS, options.cloudLogOptions), "f");
        }
        else {
            __classPrivateFieldSet(this, _LoggingCommon_cloudLogOptions, Object.assign(DEFAULT_LOGGING_LOGSYNC_OPTIONS, options.cloudLogOptions), "f");
        }
        __classPrivateFieldSet(this, _LoggingCommon_flushCheckIntervalMs, options.flushCheckIntervalMs ?? 500, "f"); // 0.5s
        __classPrivateFieldSet(this, _LoggingCommon_flushTimeoutMs, options.flushTimeoutMs ?? 30000, "f"); // 30s
    }
    mapSeverity(logLevel) {
        if (typeof logLevel == "number") {
            logLevel = ~~(logLevel / 10) * 10; // round down to tenth
            if (logLevel < 10)
                logLevel = 10;
            else if (logLevel > 60)
                logLevel = 60;
        }
        const severity = (logLevel && __classPrivateFieldGet(this, _LoggingCommon_severityMap, "f")[logLevel]) || "default";
        return severity;
    }
    async init() {
        const clientLogging = new logging_1.Logging(__classPrivateFieldGet(this, _LoggingCommon_clientLoggingOptions, "f"));
        if (!__classPrivateFieldGet(this, _LoggingCommon_redirectToStdout, "f")) {
            await clientLogging.setProjectId();
            await clientLogging.setDetectedResource();
            __classPrivateFieldSet(this, _LoggingCommon_cloudLog, clientLogging.log(this.defaultMetadata.logName, __classPrivateFieldGet(this, _LoggingCommon_cloudLogOptions, "f")), "f");
        }
        else {
            __classPrivateFieldSet(this, _LoggingCommon_cloudLog, clientLogging.logSync(this.defaultMetadata.logName, undefined, __classPrivateFieldGet(this, _LoggingCommon_cloudLogOptions, "f")), "f");
        }
    }
    // expose this instead of sharp notation so we can run test
    get cloudLog() {
        return __classPrivateFieldGet(this, _LoggingCommon_cloudLog, "f");
    }
    async log(obj) {
        if (!this.cloudLog)
            throw new Error("Transport not init() yet");
        const metadata = typeof obj[__classPrivateFieldGet(this, _LoggingCommon_metadataKey, "f")] === "object"
            ? obj[__classPrivateFieldGet(this, _LoggingCommon_metadataKey, "f")]
            : {};
        delete obj[__classPrivateFieldGet(this, _LoggingCommon_metadataKey, "f")];
        // Google logging use `message` key as message body
        // Move it to `message` if pino uses different one
        if (__classPrivateFieldGet(this, _LoggingCommon_messageKey, "f") && __classPrivateFieldGet(this, _LoggingCommon_messageKey, "f") != "message") {
            obj["message"] = obj[__classPrivateFieldGet(this, _LoggingCommon_messageKey, "f")];
            delete obj[__classPrivateFieldGet(this, _LoggingCommon_messageKey, "f")];
        }
        const entryMetadata = {
            ...metadata,
            labels: Object.assign({}, this.defaultMetadata.labels, metadata.labels),
            resource: Object.assign({}, this.defaultMetadata.resource, metadata.resource),
            severity: this.mapSeverity(obj["level"]).toUpperCase(),
        };
        // Attach serviceContext if there is an error from payload
        if (obj[__classPrivateFieldGet(this, _LoggingCommon_errorKey, "f")] && __classPrivateFieldGet(this, _LoggingCommon_serviceContext, "f"))
            obj["serviceContext"] = __classPrivateFieldGet(this, _LoggingCommon_serviceContext, "f");
        // If the obj contains a httpRequest property, promote it to the
        // entry metadata. This allows Cloud Logging to use request log formatting.
        // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#HttpRequest
        // Note that the httpRequest field must properly validate as HttpRequest
        // proto message, or the log entry would be rejected by the API. We no do
        // validation here.
        if (obj[__classPrivateFieldGet(this, _LoggingCommon_httpRequestKey, "f")] &&
            typeof obj[__classPrivateFieldGet(this, _LoggingCommon_httpRequestKey, "f")] === "object") {
            entryMetadata.httpRequest = obj[__classPrivateFieldGet(this, _LoggingCommon_httpRequestKey, "f")];
            delete obj[__classPrivateFieldGet(this, _LoggingCommon_httpRequestKey, "f")];
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
        const entries = [];
        entries.push(this.entry(entryMetadata, obj));
        if (this.cloudLog instanceof logging_1.Log) {
            this.bottleneck.schedule((log, entries) => {
                return log.write(entries);
            }, this.cloudLog, entries);
        }
        else {
            this.cloudLog.write(entries);
        }
    }
    entry(metadata, data) {
        if (__classPrivateFieldGet(this, _LoggingCommon_redirectToStdout, "f")) {
            return this.cloudLog.entry(metadata, data);
        }
        return this.cloudLog.entry(metadata, data);
    }
    async flush() {
        const start = Date.now();
        while (Date.now() - start < __classPrivateFieldGet(this, _LoggingCommon_flushTimeoutMs, "f")) {
            const cnt = this.bottleneck.counts();
            if (cnt.RECEIVED == 0 &&
                cnt.QUEUED == 0 &&
                cnt.RUNNING == 0 &&
                cnt.EXECUTING == 0)
                break;
            await sleep(__classPrivateFieldGet(this, _LoggingCommon_flushCheckIntervalMs, "f"));
        }
    }
}
exports.LoggingCommon = LoggingCommon;
_LoggingCommon_clientLoggingOptions = new WeakMap(), _LoggingCommon_cloudLog = new WeakMap(), _LoggingCommon_cloudLogOptions = new WeakMap(), _LoggingCommon_errorKey = new WeakMap(), _LoggingCommon_httpRequestKey = new WeakMap(), _LoggingCommon_messageKey = new WeakMap(), _LoggingCommon_metadataKey = new WeakMap(), _LoggingCommon_redirectToStdout = new WeakMap(), _LoggingCommon_serviceContext = new WeakMap(), _LoggingCommon_severityMap = new WeakMap(), _LoggingCommon_flushCheckIntervalMs = new WeakMap(), _LoggingCommon_flushTimeoutMs = new WeakMap();
// LOGGING_TRACE_KEY is Cloud Logging specific and has the format:
// logging.googleapis.com/trace
LoggingCommon.LOGGING_TRACE_KEY = options_1.LOGGING_TRACE_KEY;
// LOGGING_TRACE_KEY is Cloud Logging specific and has the format:
// logging.googleapis.com/spanId
LoggingCommon.LOGGING_SPAN_KEY = options_1.LOGGING_SPAN_KEY;
// LOGGING_SAMPLED_KEY is Cloud Logging specific and has the format:
// logging.googleapis.com/trace_sampled
LoggingCommon.LOGGING_SAMPLED_KEY = options_1.LOGGING_SAMPLED_KEY;
//# sourceMappingURL=LoggingCommon.js.map