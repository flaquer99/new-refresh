import type { ScanErrorCode } from "@refresh/scan-contracts/errors";

export class ScanLimitError extends Error {
  readonly code: Extract<
    ScanErrorCode,
    "SCAN_ALREADY_RUNNING" | "CAPACITY_REACHED"
  >;

  constructor(code: ScanLimitError["code"], message: string) {
    super(message);
    this.name = "ScanLimitError";
    this.code = code;
  }
}

export class ScanConflictError extends ScanLimitError {
  constructor() {
    super(
      "SCAN_ALREADY_RUNNING",
      "A scan is already running for you. Wait for it to finish or cancel it.",
    );
    this.name = "ScanConflictError";
  }
}

export class CapacityError extends ScanLimitError {
  constructor() {
    super(
      "CAPACITY_REACHED",
      "The scanner is busy right now. Try again in a few minutes.",
    );
    this.name = "CapacityError";
  }
}
