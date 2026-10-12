import { describe, expect, it } from "vitest";
import { generateMetadata } from "./page";

const pageProps = (searchParams: Record<string, string>) =>
	({
		params: Promise.resolve({}),
		searchParams: Promise.resolve(searchParams),
	}) as unknown as Parameters<typeof generateMetadata>[0];

describe("history page metadata", () => {
	it("titles a malformed cursor as the newest scans, matching the entries shown", async () => {
		// GIVEN
		const props = pageProps({ before: "garbage" });

		// WHEN
		const metadata = await generateMetadata(props);

		// THEN
		expect(metadata.title).toBe("Scan history");
	});
});
