type StartScanButtonProps = {
	isStarting: boolean;
};

export function StartScanButton({ isStarting }: StartScanButtonProps) {
	return (
		<button
			className="self-start rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-70"
			disabled={isStarting}
			type="submit"
		>
			{isStarting ? "Starting scan…" : "Scan"}
		</button>
	);
}
