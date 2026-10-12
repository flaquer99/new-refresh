import { Button } from "@/components/ui/button";

type StartScanButtonProps = {
	isStarting: boolean;
};

export function StartScanButton({ isStarting }: StartScanButtonProps) {
	return (
		<Button
			className="self-start"
			disabled={isStarting}
			size="lg"
			type="submit"
		>
			{isStarting ? "Starting scan…" : "Scan"}
		</Button>
	);
}
