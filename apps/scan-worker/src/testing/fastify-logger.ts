import type { FastifyBaseLogger } from "fastify";
import { type Mock, vi } from "vitest";

type LogFn = FastifyBaseLogger["info"];

export type RecordingFastifyLogger = FastifyBaseLogger & {
  info: Mock<LogFn>;
  warn: Mock<LogFn>;
  error: Mock<LogFn>;
};

const recordLog = () => vi.fn<LogFn>();

export const createRecordingFastifyLogger = (): RecordingFastifyLogger => {
  const logger: RecordingFastifyLogger = {
    level: "info",
    fatal: recordLog(),
    error: recordLog(),
    warn: recordLog(),
    info: recordLog(),
    debug: recordLog(),
    trace: recordLog(),
    silent: recordLog(),
    child: () => logger,
  };
  return logger;
};
