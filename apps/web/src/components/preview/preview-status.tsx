import { StatusIndicator } from "@/components/hud/status-indicator";
import {
	type PreviewStatusValue,
	statusMessage,
} from "@/lib/preview/preview-messages";

type PreviewStatusProps = {
	status: PreviewStatusValue;
};

export function PreviewStatus({ status }: PreviewStatusProps) {
	const loading =
		status.kind === "highlight" && status.state.outcome === "loading";
	return (
		<div aria-live="polite" role="status">
			<StatusIndicator active={loading} label={statusMessage(status)} />
		</div>
	);
}
