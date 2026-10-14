import type { Viewport } from "@refresh/scan-contracts/findings";
import { Button } from "@/components/ui/button";
import { VIEWPORT_LABELS } from "@/lib/report/labels";

const SWITCH_LABEL = "Preview viewport";
const SHORT_LABELS: Record<Viewport, string> = {
	desktop: "Desktop",
	mobile: "Mobile",
};

type ViewportSwitchProps = {
	options: readonly Viewport[];
	viewport: Viewport;
	onSelect: (viewport: Viewport) => void;
};

export function ViewportSwitch({
	options,
	viewport,
	onSelect,
}: ViewportSwitchProps) {
	return (
		<fieldset className="flex gap-2">
			<legend className="sr-only">{SWITCH_LABEL}</legend>
			{options.map((option) => (
				<Button
					aria-label={VIEWPORT_LABELS[option]}
					aria-pressed={option === viewport}
					key={option}
					onClick={() => onSelect(option)}
					size="sm"
					type="button"
					variant={option === viewport ? "default" : "outline"}
				>
					{SHORT_LABELS[option]}
				</Button>
			))}
		</fieldset>
	);
}
