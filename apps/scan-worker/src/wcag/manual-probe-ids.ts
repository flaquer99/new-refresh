export const ALWAYS_PROBE = "always";

export const PAGE_PROBE_CRITERIA = {
  [ALWAYS_PROBE]: [
    "1.3.2",
    "1.3.3",
    "1.4.1",
    "1.4.11",
    "1.4.12",
    "2.1.1",
    "2.1.2",
    "2.4.3",
    "2.4.7",
    "3.1.2",
  ],
  "informative-image": ["1.1.1"],
  media: ["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"],
  "image-content": ["1.4.5"],
  "horizontal-overflow": ["1.4.10"],
  "hover-content": ["1.4.13"],
  "timed-content": ["2.2.1"],
  animation: ["2.2.2", "2.3.1"],
  "headings-or-labels": ["2.4.6"],
  "fixed-position": ["2.4.11"],
  "pointer-widget": ["2.5.1", "2.5.2"],
  "drag-widget": ["2.5.7"],
  "form-control": [
    "3.2.1",
    "3.2.2",
    "3.3.1",
    "3.3.3",
    "3.3.4",
    "3.3.7",
    "4.1.3",
  ],
  authentication: ["3.3.8"],
} as const;

export const SITE_PROBE_MIN_PAGES = {
  [ALWAYS_PROBE]: 1,
  "multiple-pages": 2,
} as const;

export const SITE_PROBE_CRITERIA = {
  [ALWAYS_PROBE]: ["2.1.4", "2.5.4"],
  "multiple-pages": ["2.4.5", "3.2.3", "3.2.4", "3.2.6"],
} as const;

export type PageProbeId = keyof typeof PAGE_PROBE_CRITERIA;
export type SiteProbeId = keyof typeof SITE_PROBE_CRITERIA;
export type ManualProbeId = PageProbeId | SiteProbeId;
