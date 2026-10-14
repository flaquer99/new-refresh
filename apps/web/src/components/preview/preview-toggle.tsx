import { Button } from "@/components/ui/button";

const SHOW_LABEL = "Show preview";
const HIDE_LABEL = "Hide preview";

type PreviewToggleProps = {
	open: boolean;
	controls: string;
	describedBy: string;
	onToggle: () => void;
};

export function PreviewToggle({
	open,
	controls,
	describedBy,
	onToggle,
}: PreviewToggleProps) {
	return (
		<Button
			aria-controls={controls}
			aria-describedby={describedBy}
			aria-expanded={open}
			className="self-start"
			onClick={onToggle}
			size="sm"
			type="button"
			variant="outline"
		>
			{open ? HIDE_LABEL : SHOW_LABEL}
		</Button>
	);
}
