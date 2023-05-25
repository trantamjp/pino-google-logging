/// <reference types="node" />
import type { GoogleLoggingTransportOptions } from "./options";
export * from "./options";
export default function (opts: GoogleLoggingTransportOptions): Promise<import("stream").Transform & import("pino-abstract-transport").OnUnknown>;
//# sourceMappingURL=index.d.ts.map