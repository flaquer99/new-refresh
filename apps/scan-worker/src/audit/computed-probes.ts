import type { Viewport } from "@refresh/scan-contracts/findings";
import type { Page } from "playwright";
import type { PageProbeId } from "../wcag/manual-probe-ids.js";

const ANIMATED_ELEMENTS = "video[autoplay], marquee";
const FIXED_POSITIONS = ["fixed", "sticky"];
const OVERFLOW_VIEWPORT: Viewport = "mobile";

type ComputedProbe = {
  id: PageProbeId;
  appliesTo: (viewport: Viewport) => boolean;
  matches: (page: Page) => Promise<boolean>;
};

const hasAnimation = (page: Page): Promise<boolean> =>
  page.evaluate(
    (selector) =>
      document.getAnimations().length > 0 ||
      document.querySelector(selector) !== null,
    ANIMATED_ELEMENTS,
  );

const hasFixedPosition = (page: Page): Promise<boolean> =>
  page.evaluate(
    (positions) =>
      Array.from(document.querySelectorAll("body *")).some((element) =>
        positions.includes(getComputedStyle(element).position),
      ),
    FIXED_POSITIONS,
  );

const hasHorizontalOverflow = (page: Page): Promise<boolean> =>
  page.evaluate(() => {
    const root = document.scrollingElement;
    return root !== null && root.scrollWidth > root.clientWidth;
  });

const everyViewport = () => true;

const COMPUTED_PROBES: readonly ComputedProbe[] = [
  { id: "animation", appliesTo: everyViewport, matches: hasAnimation },
  { id: "fixed-position", appliesTo: everyViewport, matches: hasFixedPosition },
  {
    id: "horizontal-overflow",
    appliesTo: (viewport) => viewport === OVERFLOW_VIEWPORT,
    matches: hasHorizontalOverflow,
  },
];

export const matchComputedProbes = async (
  page: Page,
  viewport: Viewport,
): Promise<PageProbeId[]> => {
  const matched: PageProbeId[] = [];
  for (const probe of COMPUTED_PROBES) {
    if (probe.appliesTo(viewport) && (await probe.matches(page))) {
      matched.push(probe.id);
    }
  }
  return matched;
};
