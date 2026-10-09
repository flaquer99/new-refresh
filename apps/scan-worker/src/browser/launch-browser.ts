import { type Browser, chromium } from "playwright";
import type { EgressGuard } from "../network/egress-guard.js";

export const PROXY_LOOPBACK_THROUGH_GUARD = "<-loopback>";
export const DISABLE_NON_PROXIED_UDP =
  "--force-webrtc-ip-handling-policy=disable_non_proxied_udp";

export const launchGuardedBrowser = (
  guard: Pick<EgressGuard, "url">,
): Promise<Browser> =>
  chromium.launch({
    headless: true,
    proxy: { server: guard.url, bypass: PROXY_LOOPBACK_THROUGH_GUARD },
    args: [DISABLE_NON_PROXIED_UDP],
  });
