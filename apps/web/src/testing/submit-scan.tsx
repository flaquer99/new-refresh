import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ScanPage } from "@/components/scan/scan-page";
import { START_URL } from "./finding-fixtures";

export const submitScan = async (): Promise<void> => {
	render(<ScanPage />);
	fireEvent.change(screen.getByLabelText("Website address"), {
		target: { value: START_URL },
	});
	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Scan" }));
		await vi.advanceTimersByTimeAsync(0);
	});
};
