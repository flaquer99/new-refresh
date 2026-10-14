import { UNKNOWN_MEMBER_LABEL } from "@/lib/history/history-labels";

type ScanStarterProps = {
	name: string | null;
};

export function ScanStarter({ name }: ScanStarterProps) {
	return (
		<p className="text-muted-foreground text-sm">
			Started by {name ?? UNKNOWN_MEMBER_LABEL}
		</p>
	);
}
