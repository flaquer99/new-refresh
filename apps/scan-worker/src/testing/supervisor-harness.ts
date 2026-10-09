import { afterEach, beforeEach, vi } from "vitest";
import { superviseBrowser } from "../browser/browser-supervisor.js";
import { fakeLauncher } from "./fake-browser.js";
import { createRecordingFastifyLogger } from "./fastify-logger.js";

export const startSupervised = async () => {
  const launcher = fakeLauncher();
  const logger = createRecordingFastifyLogger();
  const supervisor = await superviseBrowser({
    launch: launcher.launch,
    logger,
  });
  return { ...launcher, logger, supervisor };
};

export const useSupervisorClock = () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });
};
