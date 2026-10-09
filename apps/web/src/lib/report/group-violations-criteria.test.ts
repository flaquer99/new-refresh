import { describe, expect, it } from "vitest";
import {
	buildViolation,
	CONTRAST_MINIMUM,
	NON_TEXT_CONTENT,
} from "@/testing/finding-fixtures";
import { groupViolations } from "./group-violations";

describe("groupViolations by criterion", () => {
	it("lists a violation under each of its criteria", () => {
		// GIVEN
		const shared = buildViolation({
			id: "shared",
			criteria: [NON_TEXT_CONTENT, CONTRAST_MINIMUM],
		});

		// WHEN
		const groups = groupViolations([shared], "criterion");

		// THEN
		expect(
			groups.map(({ key, violations: items }) => ({
				key,
				ids: items.map(({ id }) => id),
			})),
		).toEqual([
			{ key: "1.1.1", ids: ["shared"] },
			{ key: "1.4.3", ids: ["shared"] },
		]);
	});
});
