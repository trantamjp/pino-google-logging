import pinoGoogleLoggingTransport from "../src";
import { DEFAULT_SEVERITY_MAP, LoggingCommon } from "@/LoggingCommon";
import { LogSync, Logging } from "@google-cloud/logging";

const mockLogSync = jest
  .spyOn(LogSync.prototype, "write")
  .mockImplementation(jest.fn());

const clientLogging = new Logging();
const cloudLogInstance = new LogSync(clientLogging, "test_log", undefined, {
  useMessageField: true,
});

(
  jest.spyOn(
    LoggingCommon.prototype,
    "cloudLog" as keyof LoggingCommon,
    "get"
  ) as unknown as jest.SpyInstance<LogSync>
).mockImplementation(() => cloudLogInstance);

describe("Log", () => {
  beforeEach(() => {
    mockLogSync.mockClear();
  });

  afterAll(() => {
    mockLogSync.mockRestore();
  });

  test("should send log", async () => {
    const transport = await pinoGoogleLoggingTransport({
      messageKey: "msg",
      errorKey: "err",
      metadataKey: "meta",
      redirectToStdout: true,
    });

    const logs = [
      {
        level: 10,
        time: 1617955768092,
        pid: 2942,
        hostname: "MacBook-Pro.local",
        msg: "hello world",
      },
      {
        level: 20,
        time: 1617955768092,
        pid: 2942,
        hostname: "MacBook-Pro.local",
        msg: "another message",
        prop: 42,
      },
      {
        level: 30,
        time: 1617955768092,
        pid: 2942,
        hostname: "MacBook-Pro.local",
        msg: "another message",
        prop: 42,
      },
      {
        level: 40,
        time: 1617955768092,
        pid: 2942,
        hostname: "MacBook-Pro.local",
        msg: "another message",
        prop: 42,
      },
      {
        level: 50,
        time: 1617955768092,
        pid: 2942,
        hostname: "MacBook-Pro.local",
        msg: "another message",
        prop: 42,
      },
    ];

    const logSerialized = logs.map((log) => JSON.stringify(log)).join("\n");

    transport.write(logSerialized);
    transport.end();

    await new Promise<void>((resolve) => {
      transport.on("end", () => {
        logs.forEach((log, idx) => {
          const want = {
            metadata: {
              timestamp: expect.any(Date),
              labels: { logger: "pino", agent: "pino-google-logging" },
              resource: { type: "global" },
              severity: DEFAULT_SEVERITY_MAP[log.level],
              trace: null,
              traceSampled: false,
              insertId: expect.stringMatching(/^[.\w]{32}$/),
            },
            data: {
              level: log.level,
              pid: expect.any(Number),
              hostname: expect.any(String),
              message: log.msg,
              ...(log.prop
                ? {
                    prop: log.prop,
                  }
                : undefined),
            },
          };

          const got = (mockLogSync.mock.calls[idx]?.[0] as Array<unknown>)[0];
          expect(got).toEqual(expect.objectContaining(want));
        });
        resolve();
      });
    });
  });
});
