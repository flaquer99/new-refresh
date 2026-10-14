import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clerkView, resetClerkView } from "@/testing/clerk-components";
import { PageMain } from "./page-main";
import { SiteHeader } from "./site-header";
import { SkipLink } from "./skip-link";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: vi.fn() }));
vi.mock("@clerk/nextjs", async () => {
	const { clerkComponentsMock } = await import("@/testing/clerk-components");
	return clerkComponentsMock;
});

const TAB_STOPS = 5;

const renderLayout = () =>
	render(
		<>
			<SkipLink />
			<SiteHeader />
			<PageMain>
				<h1>Page</h1>
			</PageMain>
		</>,
	);

describe("layout tree", () => {
	beforeEach(() => {
		resetClerkView();
		clerkView.signedIn = true;
		vi.mocked(usePathname).mockReturnValue("/");
		vi.mocked(useTheme).mockReturnValue({
			theme: "system",
			setTheme: vi.fn(),
			themes: ["light", "dark"],
		});
	});

	it("tabs through skip link, wordmark, nav, then theme menu", async () => {
		// GIVEN
		renderLayout();
		const user = userEvent.setup();
		const order: (string | null)[] = [];

		// WHEN
		for (let stop = 0; stop < TAB_STOPS; stop += 1) {
			await user.tab();
			order.push(document.activeElement?.textContent ?? null);
		}

		// THEN
		expect(order).toEqual([
			"Skip to main content",
			"Refreshby 99x",
			"New scan",
			"Scan history",
			"Theme: System",
		]);
	});

	it("renders exactly one main landmark", () => {
		// WHEN
		renderLayout();

		// THEN
		expect(screen.getAllByRole("main")).toHaveLength(1);
	});
});
