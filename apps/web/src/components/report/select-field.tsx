import type { ChangeEvent } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import type { SelectOption } from "@/lib/report/filter-options";

type SelectFieldProps<T extends string> = {
	id: string;
	label: string;
	value: T;
	options: readonly SelectOption<T>[];
	onChange: (value: T) => void;
};

const selectHandler =
	<T extends string>(
		options: readonly SelectOption<T>[],
		onChange: (value: T) => void,
	) =>
	(event: ChangeEvent<HTMLSelectElement>) => {
		const option = options.find(
			(candidate) => candidate.value === event.target.value,
		);
		if (option) {
			onChange(option.value);
		}
	};

export function SelectField<T extends string>({
	id,
	label,
	value,
	options,
	onChange,
}: SelectFieldProps<T>) {
	return (
		<Field className="min-w-0">
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<NativeSelect
				className="w-full"
				id={id}
				onChange={selectHandler(options, onChange)}
				value={value}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</NativeSelect>
		</Field>
	);
}
