import { readFileSync } from "node:fs";
import type { Viewport } from "@refresh/scan-contracts/findings";
import type {
  AxeNodeResult,
  AxeResults,
  AxeRuleResult,
  AxeRun,
} from "../report/axe-results.js";

export const HOME_URL = "https://fixtures.test/";

const FIXTURES_DIRECTORY = new URL("../report/__fixtures__/", import.meta.url);

export const loadAxeFixture = (name: string): AxeResults =>
  JSON.parse(readFileSync(new URL(`${name}.json`, FIXTURES_DIRECTORY), "utf8"));

export const homeRuns = (): AxeRun[] => [
  {
    pageUrl: HOME_URL,
    viewport: "desktop",
    results: loadAxeFixture("home-desktop"),
  },
  {
    pageUrl: HOME_URL,
    viewport: "mobile",
    results: loadAxeFixture("home-mobile"),
  },
];

export const buildNode = (
  overrides: Partial<AxeNodeResult> = {},
): AxeNodeResult => ({
  target: ["main > button"],
  html: "<button></button>",
  impact: "serious",
  failureSummary: "Fix any of the following:\n  Element has no name",
  ...overrides,
});

export const buildRule = (
  overrides: Partial<AxeRuleResult> = {},
): AxeRuleResult => ({
  id: "button-name",
  help: "Buttons must have discernible text",
  tags: ["cat.name-role-value", "wcag2a", "wcag412"],
  nodes: [buildNode()],
  ...overrides,
});

type SingleRunInput = {
  rule: AxeRuleResult;
  kind?: keyof AxeResults;
  viewport?: Viewport;
};

export const singleRuleRun = ({
  rule,
  kind = "violations",
  viewport = "desktop",
}: SingleRunInput): AxeRun => ({
  pageUrl: HOME_URL,
  viewport,
  results: { violations: [], incomplete: [], [kind]: [rule] },
});
