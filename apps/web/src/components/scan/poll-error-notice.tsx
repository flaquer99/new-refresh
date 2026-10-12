import type { ScanError } from "@refresh/scan-contracts/errors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type PollErrorNoticeProps = {
	error: ScanError;
	onRetry: () => void;
};

export function PollErrorNotice({ error, onRetry }: PollErrorNoticeProps) {
	return (
		<div className="flex flex-col gap-3">
			<Alert variant="destructive">
				<AlertDescription>
					We lost contact with the scanner: {error.message}
				</AlertDescription>
			</Alert>
			<Button
				className="self-start"
				onClick={onRetry}
				type="button"
				variant="outline"
			>
				Check again
			</Button>
		</div>
	);
}
