export class ScanIdTakenError extends Error {
  readonly code = "SCAN_ID_TAKEN";

  constructor() {
    super("A scan with this id already exists.");
    this.name = "ScanIdTakenError";
  }
}
