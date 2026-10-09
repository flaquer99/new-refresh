import type { ScanRegistry } from "../scans/scan-registry.js";

export type ServerDeps = {
  registry: ScanRegistry;
  validateTarget: (url: string) => Promise<void>;
  token: string;
  browserConnected: () => boolean;
};
