import { describe, expect, it } from "vitest";
import { createRecordingFastifyLogger } from "../testing/fastify-logger.js";
import {
  postScan,
  startTestServer,
  useServerTestClock,
} from "../testing/server-harness.js";

const HTTP_INTERNAL_ERROR = 500;
const UNEXPECTED = new Error("resolver exploded at 10.0.0.7");

const failingValidate = () => Promise.reject(UNEXPECTED);

describe("error envelope", () => {
  useServerTestClock();

  it("hides unexpected failures behind a generic INTERNAL_ERROR", async () => {
    // GIVEN
    const { app } = startTestServer({ validate: failingValidate });

    // WHEN
    const response = await postScan(app);

    // THEN
    expect(response.statusCode).toBe(HTTP_INTERNAL_ERROR);
    expect(response.json()).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong on our side. Try again later.",
      },
    });
  });

  it("logs the unexpected failure for operators", async () => {
    // GIVEN
    const logger = createRecordingFastifyLogger();
    const { app } = startTestServer({
      validate: failingValidate,
      loggerInstance: logger,
    });

    // WHEN
    await postScan(app);

    // THEN
    expect(logger.error).toHaveBeenCalledWith(
      { err: UNEXPECTED },
      "request.failed",
    );
  });
});
