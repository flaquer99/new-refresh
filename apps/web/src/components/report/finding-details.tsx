import type { Viewport } from "@refresh/scan-contracts/findings";
import { CodeBlock } from "@/components/hud/code-block";
import { MonoValue } from "@/components/hud/mono-value";
import { formatViewports } from "@/lib/report/labels";

const HTML_LABEL = "HTML snippet";

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
		<dl className="grid min-w-0 gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
			<dt className="font-medium text-muted-foreground">Page</dt>
			<dd>
				<MonoValue>{pageUrl}</MonoValue>
			</dd>
			<dt className="font-medium text-muted-foreground">Element</dt>
			<dd>
				<MonoValue>{selector}</MonoValue>
			</dd>
			<dt className="font-medium text-muted-foreground">HTML</dt>
			<dd className="min-w-0">
				<CodeBlock code={html} label={HTML_LABEL} />
			</dd>
			<dt className="font-medium text-muted-foreground">Viewports</dt>
			<dd>{formatViewports(viewports)}</dd>
		</dl>
	);
}
