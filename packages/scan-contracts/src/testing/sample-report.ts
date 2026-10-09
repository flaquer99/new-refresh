const CONTRAST_CRITERION = {
  id: "1.4.3",
  name: "Contrast (Minimum)",
  level: "AA",
  understandingUrl:
    "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
};

export const buildViolation = () => ({
  id: "2b7d",
  ruleId: "color-contrast",
  criteria: [CONTRAST_CRITERION],
  level: "AA",
  severity: "serious",
  pageUrl: "https://www.example.org/",
  selector: "footer > p.legal",
  html: '<p class="legal">© 2026 Example</p>',
  viewports: ["desktop", "mobile"],
  description: "Elements must meet minimum color contrast ratio thresholds",
  fixGuidance: "Fix any of the following: insufficient color contrast",
});

export const buildReport = () => ({
  startUrl: "https://www.example.org/",
  origin: "https://www.example.org",
  depth: 1,
  outcome: "complete",
  startedAt: "2026-10-09T10:00:00.000Z",
  finishedAt: "2026-10-09T10:01:00.000Z",
  summary: {
    pagesScanned: 1,
    pagesSkipped: 0,
    pagesFailed: 0,
    totalViolations: 1,
    violationsBySeverity: { critical: 0, serious: 1, moderate: 0, minor: 0 },
    violationsByLevel: { A: 0, AA: 1 },
    needsReviewCount: 0,
  },
  violations: [buildViolation()],
  reviewItems: [],
  manualChecks: [],
  pages: [
    {
      url: "https://www.example.org/",
      depth: 0,
      status: "scanned",
      reason: null,
      httpStatus: 200,
    },
  ],
});
