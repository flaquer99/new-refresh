import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { DEPTH_HINT, DEPTH_OPTIONS } from "@/lib/scans/depth-options";

const SELECT_ID = "scan-depth";
const HINT_ID = "scan-depth-hint";

type DepthFieldProps = {
	value: number;
	onChange: (depth: number) => void;
};

export function DepthField({ value, onChange }: DepthFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor={SELECT_ID}>Crawl depth</FieldLabel>
			<FieldDescription id={HINT_ID}>{DEPTH_HINT}</FieldDescription>
			<NativeSelect
				aria-describedby={HINT_ID}
				className="w-full"
				id={SELECT_ID}
				name="depth"
				onChange={(event) => onChange(Number(event.target.value))}
				value={value}
			>
				{DEPTH_OPTIONS.map((option) => (
					<NativeSelectOption key={option.value} value={option.value}>
						{option.label}
					</NativeSelectOption>
				))}
			</NativeSelect>
		</Field>
	);
}
