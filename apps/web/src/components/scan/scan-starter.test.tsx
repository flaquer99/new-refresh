import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScanStarter } from "./scan-starter";

describe("ScanStarter", () => {
	it("shows who started the scan", () => {
		// WHEN
		render(<ScanStarter name="Ana Souza" />);

		// THEN
		expect(screen.getByText("Started by Ana Souza")).toBeTruthy();
	});

	it("falls back to Unknown member when the name is missing", () => {
		// WHEN
		render(<ScanStarter name={null} />);

		// THEN
		expect(screen.getByText("Started by Unknown member")).toBeTruthy();
	});
});
