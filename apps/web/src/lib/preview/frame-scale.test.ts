import { describe, expect, it } from "vitest";
import { frameScale } from "./frame-scale";

describe("frameScale", () => {
	it("fits a 1280 px frame into a 600 px container", () => {
		// GIVEN / WHEN
		const scale = frameScale({ containerWidth: 600, frameWidth: 1280 });

		// THEN
		expect(scale).toBe(600 / 1280);
	});

	it("never scales a frame up past its natural size", () => {
		// GIVEN / WHEN
		const scale = frameScale({ containerWidth: 900, frameWidth: 320 });

		// THEN
		expect(scale).toBe(1);
	});

	it("keeps the natural size until the container is measured", () => {
		// GIVEN / WHEN
		const scale = frameScale({ containerWidth: 0, frameWidth: 1280 });

		// THEN
		expect(scale).toBe(1);
	});
});
