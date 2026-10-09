import type { ChangeEvent } from "react";
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
		<div className="flex min-w-0 flex-col gap-1">
			<label className="font-medium text-sm" htmlFor={id}>
				{label}
			</label>
			<select
				className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2"
				id={id}
				onChange={selectHandler(options, onChange)}
				value={value}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
