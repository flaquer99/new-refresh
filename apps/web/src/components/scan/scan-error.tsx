import type { ScanError } from "@refresh/scan-contracts/errors";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";

const HEADING_ID = "scan-error-heading";

type ScanErrorViewProps = {
	error: ScanError;
	onBack: () => void;
};

export function ScanErrorView({ error, onBack }: ScanErrorViewProps) {
	const headingRef = useFocusOnMount<HTMLHeadingElement>();
	return (
		<section
			aria-labelledby={HEADING_ID}
			className="flex flex-col gap-4 rounded-lg border border-destructive p-4 sm:p-6"
		>
			<h2
				className="font-semibold text-xl"
				id={HEADING_ID}
				ref={headingRef}
				tabIndex={-1}
			>
				The scan couldn't run
			</h2>
			<p className="text-destructive" role="alert">
				{error.message}
			</p>
			<button
				className="self-start rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
				onClick={onBack}
				type="button"
			>
				Back to form
			</button>
		</section>
	);
}
