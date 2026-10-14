import type { PreviewFetchResult } from "@refresh/scan-contracts/preview";
import type { ScanRegistry } from "../scans/scan-registry.js";

export type ServerDeps = {
  registry: ScanRegistry;
  validateTarget: (url: string) => Promise<void>;
  fetchPreview: (url: string, clientId: string) => Promise<PreviewFetchResult>;
  token: string;
  browserConnected: () => boolean;
};
