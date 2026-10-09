import { describe, expect, it } from "vitest";
import { scanPath } from "./scan-path";

describe("scanPath", () => {
	it("builds the worker path for a scan id", () => {
		// GIVEN
		const scanId = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";

		// WHEN
		const path = scanPath(scanId);

		// THEN
		expect(path).toBe("/scans/8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11");
	});

	it("encodes slashes and query characters so the id stays one path segment", () => {
		// GIVEN
		const scanId = "a/b?x=1#y";

		// WHEN
		const path = scanPath(scanId);

		// THEN
		expect(path).toBe("/scans/a%2Fb%3Fx%3D1%23y");
	});

	it("encodes dot segments so the path cannot climb out of /scans", () => {
		// GIVEN
		const scanId = "..";

		// WHEN
		const path = scanPath(scanId);

		// THEN
		expect(path).toBe("/scans/%2E%2E");
	});
});
