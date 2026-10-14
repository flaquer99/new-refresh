import { fixtureUrl } from "./support/ports";
import { HIGHLIGHTED } from "./support/seeded-report";
import { expect, test } from "./support/test";

const OPEN_COUNT = 20;
const MIN_HIGHLIGHTED = 19;
const HIGHLIGHT_DEADLINE_MS = 5000;
const TEST_TIMEOUT_MS = 180_000;

test.describe("E2E-15 — previews highlight quickly", () => {
	test.setTimeout(TEST_TIMEOUT_MS);

	test("highlights at least 19 of 20 opens within 5 seconds", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: fixtureUrl("/report-mix/"), depth: 1 });
		const cards = app.report.violationsRegion().getByRole("article");
		const cardCount = await cards.count();
		let highlighted = 0;

		// WHEN
		for (let open = 0; open < OPEN_COUNT; open += 1) {
			const card = cards.nth(open % cardCount);
			const toggle = card.getByRole("button", { name: "Show preview" });
			const status = card.getByRole("status");
			await toggle.click();
			const reached = await expect(status)
				.toHaveText(HIGHLIGHTED, { timeout: HIGHLIGHT_DEADLINE_MS })
				.then(() => true)
				.catch(() => false);
			highlighted += reached ? 1 : 0;
			await card.getByRole("button", { name: "Hide preview" }).click();
		}

		// THEN
		expect(highlighted).toBeGreaterThanOrEqual(MIN_HIGHLIGHTED);
	});
});
