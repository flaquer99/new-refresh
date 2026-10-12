import type { Ref } from "react";
import { Field, FieldDescription } from "@/components/ui/field";
import { FieldError } from "./field-error";
import { UrlInput } from "./url-input";

const INPUT_ID = "scan-url";
const HINT_ID = "scan-url-hint";
const ERROR_ID = "scan-url-error";

type UrlFieldProps = {
	value: string;
	error: string | null;
	ref: Ref<HTMLInputElement>;
	onChange: (value: string) => void;
	onBlur: () => void;
};

export function UrlField({
	value,
	error,
	ref,
	onChange,
	onBlur,
}: UrlFieldProps) {
	const hasError = error !== null;
	return (
		<Field data-invalid={hasError}>
			<UrlInput
				describedBy={hasError ? `${HINT_ID} ${ERROR_ID}` : HINT_ID}
				hasError={hasError}
				id={INPUT_ID}
				onBlur={onBlur}
				onChange={onChange}
				ref={ref}
				value={value}
			/>
			<FieldDescription id={HINT_ID}>
				For example, https://www.example.org/
			</FieldDescription>
			<FieldError id={ERROR_ID} message={error} />
		</Field>
	);
}
