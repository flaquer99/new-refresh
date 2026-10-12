import type { ScanError } from "@refresh/scan-contracts/errors";

type PollErrorNoticeProps = {
	error: ScanError;
	onRetry: () => void;
};

export function PollErrorNotice({ error, onRetry }: PollErrorNoticeProps) {
	return (
		<div className="flex flex-col gap-3 rounded-lg border border-destructive p-4">
			<p className="text-destructive" role="alert">
				We lost contact with the scanner: {error.message}
			</p>
			<button
				className="self-start rounded-md border border-border px-4 py-2 font-medium"
				onClick={onRetry}
				type="button"
			>
				Check again
			</button>
		</div>
	);
}
