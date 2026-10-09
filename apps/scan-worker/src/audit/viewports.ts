import type { Viewport } from "@refresh/scan-contracts/findings";

export type ViewportSize = { width: number; height: number };

export const VIEWPORT_SIZES = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 320, height: 640 },
} as const satisfies Record<Viewport, ViewportSize>;

export const USER_AGENT_SUFFIX = "RefreshA11yScanner/1.0";
