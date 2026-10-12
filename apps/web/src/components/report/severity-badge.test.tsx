import { SEVERITIES } from "@refresh/scan-contracts/findings";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SEVERITY_LABELS, SEVERITY_SYMBOLS } from "@/lib/report/severity";
import { SeverityBadge } from "./severity-badge";

describe("SeverityBadge", () => {
	it.each(SEVERITIES)("shows the symbol and text label for %s", (severity) => {
		// GIVEN / WHEN
		const { container } = render(<SeverityBadge severity={severity} />);

		// THEN
		const symbol = container.querySelector('[aria-hidden="true"]');
		expect(symbol?.textContent).toBe(SEVERITY_SYMBOLS[severity]);
		expect(container.textContent).toBe(
			`${SEVERITY_SYMBOLS[severity]}Severity: ${SEVERITY_LABELS[severity]}`,
		);
	});

	it("hides the severity prefix visually but keeps it for screen readers", () => {
		// GIVEN / WHEN
		const { container } = render(<SeverityBadge severity="critical" />);

		// THEN
		const prefix = container.querySelector(".sr-only");
		expect(prefix?.textContent).toBe("Severity: ");
	});
});
