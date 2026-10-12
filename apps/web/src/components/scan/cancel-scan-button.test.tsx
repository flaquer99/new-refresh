import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CancelScanButton } from "./cancel-scan-button";

const renderButton = (onCancel: () => Promise<boolean>) => {
	render(<CancelScanButton onCancel={onCancel} />);
	return userEvent.setup();
};

describe("CancelScanButton", () => {
	it("offers Cancel again when the cancel did not go through", async () => {
		// GIVEN
		const user = renderButton(vi.fn().mockResolvedValue(false));

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel scan" }));

		// THEN
		expect(screen.getByRole("button", { name: "Cancel scan" })).toHaveProperty(
			"disabled",
			false,
		);
	});

	it("stays disabled while the accepted cancel settles the page", async () => {
		// GIVEN
		const user = renderButton(vi.fn().mockResolvedValue(true));

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel scan" }));

		// THEN
		expect(screen.getByRole("button", { name: "Cancelling…" })).toHaveProperty(
			"disabled",
			true,
		);
	});
});
