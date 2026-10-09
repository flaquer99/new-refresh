import { vi } from "vitest";

export const createRecordingLogger = () => ({
  warn: vi.fn(),
});
