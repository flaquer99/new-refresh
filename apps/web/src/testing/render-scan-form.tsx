import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ScanForm } from "@/components/scan/scan-form";

export const URL_LABEL = "Website address";
export const DEPTH_LABEL = "Crawl depth";
export const INVALID_URL =
	"Enter a full web address that starts with http:// or https://.";

type RenderScanFormOptions = {
	isStarting?: boolean;
	initialRequest?: ScanRequest | null;
};

export const renderScanForm = ({
	isStarting = false,
	initialRequest = null,
}: RenderScanFormOptions = {}) => {
	const onSubmit = vi.fn();
	render(
		<ScanForm
			focusOnMount={false}
			initialRequest={initialRequest}
			isStarting={isStarting}
			onSubmit={onSubmit}
		/>,
	);
	return { onSubmit, user: userEvent.setup() };
};

export const submitInvalidUrl = async () => {
	const rendered = renderScanForm();
	const input = screen.getByLabelText(URL_LABEL);
	await rendered.user.type(input, "ftp://example.org");
	await rendered.user.click(screen.getByRole("button", { name: "Scan" }));
	return { ...rendered, input };
};
