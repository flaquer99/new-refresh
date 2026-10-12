import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageMain } from "./page-main";

describe("PageMain", () => {
	it("renders a main landmark that scripts can focus", () => {
		// GIVEN
		render(<PageMain>Content</PageMain>);

		// THEN
		const main = screen.getByRole("main");
		expect(main.id).toBe("main-content");
		expect(main.getAttribute("tabindex")).toBe("-1");
	});

	it("names the landmark by the given heading", () => {
		// GIVEN
		render(
			<PageMain labelledBy="title">
				<h1 id="title">Scan history</h1>
			</PageMain>,
		);

		// THEN
		expect(screen.getByRole("main", { name: "Scan history" }).id).toBe(
			"main-content",
		);
	});
});
