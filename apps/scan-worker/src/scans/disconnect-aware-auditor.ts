import type { ScanAuditor } from "./scan-runner.js";

export type ConnectionProbe = { isConnected: () => boolean };

const assertConnected = (browser: ConnectionProbe) => {
  if (!browser.isConnected()) {
    throw new Error("Browser disconnected");
  }
};

export const disconnectAwareAuditor = (
  auditor: ScanAuditor,
  browser: ConnectionProbe,
): ScanAuditor => ({
  audit: async (input) => {
    assertConnected(browser);
    const result = await auditor.audit(input);
    assertConnected(browser);
    return result;
  },
  close: () => auditor.close(),
});
