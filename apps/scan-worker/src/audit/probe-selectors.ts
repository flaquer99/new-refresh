import type { PageProbeId } from "../wcag/manual-probe-ids.js";

const MEDIA_IFRAME_HOSTS = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "wistia.com",
  "soundcloud.com",
  "spotify.com",
];

const mediaIframes = MEDIA_IFRAME_HOSTS.map((host) => `iframe[src*="${host}"]`);

export const PROBE_SELECTORS = {
  "informative-image": 'img[alt]:not([alt=""]), [role="img"][aria-label]',
  media: ["video", "audio", ...mediaIframes].join(", "),
  "image-content": "img, svg, canvas",
  "hover-content": '[role="tooltip"], [title], [aria-describedby]',
  "timed-content": 'meta[http-equiv="refresh" i], form',
  "headings-or-labels": "h1, h2, h3, h4, h5, h6, label",
  "pointer-widget": 'canvas, [draggable="true"], [role="slider"]',
  "drag-widget": '[draggable="true"], [role="slider"], input[type="range"]',
  "form-control": "form, input, select, textarea",
  authentication: 'input[type="password"], [autocomplete="one-time-code"]',
} as const satisfies Partial<Record<PageProbeId, string>>;

export type SelectorProbeId = keyof typeof PROBE_SELECTORS;
