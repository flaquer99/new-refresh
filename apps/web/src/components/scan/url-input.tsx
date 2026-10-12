import type { Ref } from "react";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type UrlInputProps = {
	id: string;
	value: string;
	describedBy: string;
	hasError: boolean;
	ref: Ref<HTMLInputElement>;
	onChange: (value: string) => void;
	onBlur: () => void;
};

export function UrlInput({
	id,
	value,
	describedBy,
	hasError,
	ref,
	onChange,
	onBlur,
}: UrlInputProps) {
	return (
		<>
			<FieldLabel htmlFor={id}>Website address</FieldLabel>
			<Input
				aria-describedby={describedBy}
				aria-invalid={hasError}
				autoComplete="url"
				id={id}
				onBlur={onBlur}
				onChange={(event) => onChange(event.target.value)}
				ref={ref}
				required
				type="url"
				value={value}
			/>
		</>
	);
}
