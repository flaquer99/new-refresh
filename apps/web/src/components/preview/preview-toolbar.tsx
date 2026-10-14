import type { Viewport } from "@refresh/scan-contracts/findings";
import { MonoValue } from "@/components/hud/mono-value";
import { VIEWPORT_LABELS } from "@/lib/report/labels";
import { OpenPageLink } from "./open-page-link";
import { ViewportSwitch } from "./viewport-switch";

type PreviewToolbarProps = {
	pageUrl: string;
	finalUrl: string;
	viewport: Viewport;
	options: readonly Viewport[];
	onSelect: (viewport: Viewport) => void;
};

const SWITCHABLE_OPTIONS = 2;

export function PreviewToolbar({
	pageUrl,
	finalUrl,
	viewport,
	options,
	onSelect,
}: PreviewToolbarProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span className="text-sm">{VIEWPORT_LABELS[viewport]}</span>
				{options.length === SWITCHABLE_OPTIONS ? (
					<ViewportSwitch
						onSelect={onSelect}
						options={options}
						viewport={viewport}
					/>
				) : null}
			</div>
			<p className="min-w-0 text-sm">
				Loaded <MonoValue>{pageUrl}</MonoValue>
			</p>
			{finalUrl === pageUrl ? null : (
				<p className="min-w-0 text-sm">
					Redirected to <MonoValue>{finalUrl}</MonoValue>
				</p>
			)}
			<OpenPageLink pageUrl={pageUrl} />
		</div>
	);
}
