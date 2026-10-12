import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeMenu } from "./theme-menu";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

const setTheme = vi.fn();

const mockTheme = (theme: string | undefined) => {
	vi.mocked(useTheme).mockReturnValue({
		theme,
		setTheme,
		themes: ["light", "dark"],
	});
};

const openMenu = async (name: string) => {
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name }));
	return user;
};

describe("ThemeMenu", () => {
	beforeEach(() => {
		setTheme.mockReset();
	});

	it("names the trigger and announces the current mode", () => {
		// GIVEN
		mockTheme("dark");

		// WHEN
		render(<ThemeMenu />);

		// THEN
		expect(screen.getByRole("button").textContent).toBe("Theme: Dark");
	});

	it("lists the three modes as radio items with the active one checked", async () => {
		// GIVEN
		mockTheme("light");
		render(<ThemeMenu />);

		// WHEN
		await openMenu("Theme: Light");

		// THEN
		const items = await screen.findAllByRole("menuitemradio");
		expect(
			items.map((item) => [
				item.textContent,
				item.getAttribute("aria-checked"),
			]),
		).toEqual([
			["System", "false"],
			["Light", "true"],
			["Dark", "false"],
		]);
	});

	it("calls setTheme with the chosen mode", async () => {
		// GIVEN
		mockTheme("system");
		render(<ThemeMenu />);
		const user = await openMenu("Theme: System");

		// WHEN
		await user.click(
			await screen.findByRole("menuitemradio", { name: "Dark" }),
		);

		// THEN
		expect(setTheme).toHaveBeenCalledWith("dark");
	});

	it("renders a neutral trigger before hydration", () => {
		// GIVEN
		mockTheme("dark");

		// WHEN
		const html = renderToString(<ThemeMenu />);

		// THEN
		expect(html).toContain('<span class="sr-only">Theme</span>');
	});
});
