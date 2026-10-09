import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { groupViolations } from "@/lib/report/group-violations";
import {
	buildViolation,
	CONTRAST_MINIMUM,
	NON_TEXT_CONTENT,
} from "@/testing/finding-fixtures";
import { ViolationGroups } from "./violation-groups";

const shared = buildViolation({
	criteria: [NON_TEXT_CONTENT, CONTRAST_MINIMUM],
});

describe("ViolationGroups", () => {
	it("gives each copy of a violation listed under several criteria a unique heading id", () => {
		// GIVEN
		const groups = groupViolations([shared], "criterion");

		// WHEN
		render(<ViolationGroups groups={groups} />);

		// THEN
		const ids = screen
			.getAllByRole("heading", { level: 4 })
			.map((heading) => heading.id);
		expect(new Set(ids).size).toBe(2);
	});

	it("names each copy of a shared violation after its description", () => {
		// GIVEN
		const groups = groupViolations([shared], "criterion");

		// WHEN
		render(<ViolationGroups groups={groups} />);

		// THEN
		expect(
			screen.getAllByRole("article", { name: shared.description }),
		).toHaveLength(2);
	});
});
