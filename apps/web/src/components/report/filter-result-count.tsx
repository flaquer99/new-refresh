type FilterResultCountProps = {
	visible: number;
	total: number;
};

export function FilterResultCount({ visible, total }: FilterResultCountProps) {
	return (
		<output
			aria-live="polite"
			className="font-mono text-muted-foreground text-sm"
		>
			Showing {visible} of {total} violations
		</output>
	);
}
