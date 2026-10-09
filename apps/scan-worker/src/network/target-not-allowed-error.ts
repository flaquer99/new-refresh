import type { ScanErrorCode } from "@refresh/scan-contracts/errors";

const URL_NOT_ALLOWED_MESSAGE =
  "This address points to a private or local network and can't be scanned.";

export class TargetNotAllowedError extends Error {
  readonly code: ScanErrorCode = "URL_NOT_ALLOWED";

  constructor() {
    super(URL_NOT_ALLOWED_MESSAGE);
    this.name = "TargetNotAllowedError";
  }
}
