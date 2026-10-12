type StatusIndicatorProps = {
	label: string;
	active?: boolean;
};

export function StatusIndicator({
	label,
	active = false,
}: StatusIndicatorProps) {
	return (
		<span className="inline-flex items-center gap-2 font-mono text-sm">
			<span aria-hidden="true" className="relative flex size-2">
				{active ? (
					<span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
				) : null}
				<span className="relative inline-flex size-2 rounded-full bg-primary" />
			</span>
			{label}
		</span>
	);
}
