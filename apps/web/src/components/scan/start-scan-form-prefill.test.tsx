import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { URL_LABEL } from "@/testing/render-scan-form";
import { mockRouter } from "@/testing/router";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const PREFILLED = { url: "https://www.example.org/", depth: "2" };

const homeFor = async (searchParams: Record<string, string>) =>
	await Home({
		params: Promise.resolve({}),
		searchParams: Promise.resolve(searchParams),
	} as unknown as Parameters<typeof Home>[0]);

describe("home page form prefill", () => {
	it("clears the form when the user moves from a prefilled link to a new scan", async () => {
		// GIVEN
		mockRouter();
		const { rerender } = render(await homeFor(PREFILLED));

		// WHEN
		rerender(await homeFor({}));

		// THEN
		expect(screen.getByLabelText<HTMLInputElement>(URL_LABEL).value).toBe("");
	});
});
