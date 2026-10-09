import { DEPTH_HINT, DEPTH_OPTIONS } from "@/lib/scans/depth-options";

const SELECT_ID = "scan-depth";
const HINT_ID = "scan-depth-hint";

type DepthFieldProps = {
	value: number;
	onChange: (depth: number) => void;
};

export function DepthField({ value, onChange }: DepthFieldProps) {
	return (
		<div className="flex flex-col gap-1">
			<label className="font-medium" htmlFor={SELECT_ID}>
				Crawl depth
			</label>
			<p className="text-muted-foreground text-sm" id={HINT_ID}>
				{DEPTH_HINT}
			</p>
			<select
				aria-describedby={HINT_ID}
				className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2"
				id={SELECT_ID}
				name="depth"
				onChange={(event) => onChange(Number(event.target.value))}
				value={value}
			>
				{DEPTH_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
