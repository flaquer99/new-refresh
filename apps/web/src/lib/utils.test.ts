import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("joins truthy class names and drops falsy ones", () => {
		// GIVEN
		const isActive = false;

		// WHEN
		const classes = cn("flex", isActive && "hidden", undefined, "gap-2");

		// THEN
		expect(classes).toBe("flex gap-2");
	});

	it("lets later Tailwind utilities override conflicting earlier ones", () => {
		// GIVEN / WHEN
		const classes = cn("px-2 text-sm", "px-4");

		// THEN
		expect(classes).toBe("text-sm px-4");
	});
});
