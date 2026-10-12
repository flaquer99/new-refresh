import { describe, expect, it } from "vitest";
import { isThemePreference, THEME_PREFERENCES } from "./theme-options";

describe("isThemePreference", () => {
	it.each(THEME_PREFERENCES)("accepts %s", (value) => {
		// Act (WHEN)
		const result = isThemePreference(value);

		// Assert (THEN)
		expect(result).toBe(true);
	});

	it.each(["sepia", "", "Dark", null, undefined, 1])("rejects %s", (value) => {
		// Act (WHEN)
		const result = isThemePreference(value);

		// Assert (THEN)
		expect(result).toBe(false);
	});
});
