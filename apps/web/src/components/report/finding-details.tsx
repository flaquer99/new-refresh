import type { Viewport } from "@refresh/scan-contracts/findings";
import { formatViewports } from "@/lib/report/labels";

type FindingDetailsProps = {
	pageUrl: string;
	selector: string;
	html: string;
	viewports: readonly Viewport[];
};

export function FindingDetails({
	pageUrl,
	selector,
	html,
	viewports,
}: FindingDetailsProps) {
	return (
		<dl className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
			<dt className="font-medium">Page</dt>
			<dd className="break-all">{pageUrl}</dd>
			<dt className="font-medium">Element</dt>
			<dd>
				<code className="break-all font-mono">{selector}</code>
			</dd>
			<dt className="font-medium">HTML</dt>
			<dd>
				<code className="block whitespace-pre-wrap break-all rounded bg-muted p-2 font-mono">
					{html}
				</code>
			</dd>
			<dt className="font-medium">Viewports</dt>
			<dd>{formatViewports(viewports)}</dd>
		</dl>
	);
}
