import { LoggingCommon } from "./LoggingCommon";
import type { GoogleLoggingTransportOptions, LogObject } from "@/options";
import build from "pino-abstract-transport";

export * from "@/options";

export default async function (opts: GoogleLoggingTransportOptions) {
  const cloudLogging = new LoggingCommon(opts);
  await cloudLogging.init();

  const buildFn = build(
    async function (source) {
      for await (const obj of source) {
        await cloudLogging.log(obj as LogObject);
      }
    },
    {
      close: (_err, cb) => {
        cloudLogging.flush().then(() => {
          cb;
        });
      },
    }
  );
  return buildFn;
}
