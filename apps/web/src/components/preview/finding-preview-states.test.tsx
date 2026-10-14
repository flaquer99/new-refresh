import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import {
	jsonResponse,
	loadedPreview,
	PREVIEW_SCAN_ID,
	unavailablePreview,
} from "@/testing/preview-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { FindingPreview } from "./finding-preview";

const renderPreview = () =>
	render(
		<>
			<h4 id="heading-1">Finding</h4>
			<FindingPreview
				findingId="finding-1"
				headingId="heading-1"
				pageUrl={START_URL}
				scanId={PREVIEW_SCAN_ID}
				viewports={["desktop", "mobile"]}
			/>
		</>,
	);

describe("FindingPreview unavailable states", () => {
	it("explains an unavailable page and keeps the open-in-new-tab link", async () => {
		// GIVEN
		stubFetch(jsonResponse(unavailablePreview({ reason: "too-large" })));
		renderPreview();

		// WHEN
		await userEvent.click(screen.getByRole("button", { name: "Show preview" }));

		// THEN
		const status = await screen.findByText(
			"Preview unavailable: the page is larger than 5 MB.",
		);
		expect(status.closest("[role=status]")).not.toBeNull();
		expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
		expect(
			screen.getByRole("link", { name: /Open page in new tab/ }),
		).not.toBeNull();
	});

	it("retries after a request-level error", async () => {
		// GIVEN
		const error = { code: "WORKER_UNAVAILABLE", message: "Down." };
		const fetchMock = stubFetch(jsonResponse({ error }, 502));
		renderPreview();
		await userEvent.click(screen.getByRole("button", { name: "Show preview" }));
		const retry = await screen.findByRole("button", { name: "Try again" });
		fetchMock.mockResolvedValue(jsonResponse(loadedPreview()));

		// WHEN
		await userEvent.click(retry);

		// THEN
		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
		expect(
			await screen.findByTitle(`Live preview of ${START_URL}`),
		).not.toBeNull();
	});
});
