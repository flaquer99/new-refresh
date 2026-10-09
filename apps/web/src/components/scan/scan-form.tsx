import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { useScanForm } from "@/hooks/use-scan-form";
import { DepthField } from "./depth-field";
import { ScanFormHeading } from "./scan-form-heading";
import { StartScanButton } from "./start-scan-button";
import { UrlField } from "./url-field";

const HEADING_ID = "scan-form-heading";

type ScanFormProps = {
	focusOnMount: boolean;
	initialRequest: ScanRequest | null;
	isStarting: boolean;
	onSubmit: (request: ScanRequest) => void;
};

export function ScanForm({
	focusOnMount,
	initialRequest,
	isStarting,
	onSubmit,
}: ScanFormProps) {
	const form = useScanForm(onSubmit, initialRequest);
	return (
		<form
			aria-labelledby={HEADING_ID}
			className="flex flex-col gap-5 rounded-lg border border-border p-4 sm:p-6"
			noValidate
			onSubmit={form.submit}
		>
			<ScanFormHeading focusOnMount={focusOnMount} id={HEADING_ID} />
			<UrlField
				error={form.urlError}
				onBlur={form.blurUrl}
				onChange={form.setUrl}
				ref={form.urlInputRef}
				value={form.url}
			/>
			<DepthField onChange={form.setDepth} value={form.depth} />
			<StartScanButton isStarting={isStarting} />
		</form>
	);
}
