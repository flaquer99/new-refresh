import { Button } from "@/components/ui/button";
import { OpenPageLink } from "./open-page-link";

const RETRY_LABEL = "Try again";

type PreviewUnavailableProps = {
	pageUrl: string;
	onRetry?: () => void;
};

export function PreviewUnavailable({
	pageUrl,
	onRetry,
}: PreviewUnavailableProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{onRetry ? (
				<Button onClick={onRetry} size="sm" type="button" variant="secondary">
					{RETRY_LABEL}
				</Button>
			) : null}
			<OpenPageLink pageUrl={pageUrl} />
		</div>
	);
}
