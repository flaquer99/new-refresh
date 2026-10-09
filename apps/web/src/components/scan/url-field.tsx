import type { Ref } from "react";
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
		<div className="flex flex-col gap-1">
			<UrlInput
				describedBy={hasError ? `${HINT_ID} ${ERROR_ID}` : HINT_ID}
				hasError={hasError}
				id={INPUT_ID}
				onBlur={onBlur}
				onChange={onChange}
				ref={ref}
				value={value}
			/>
			<p className="text-muted-foreground text-sm" id={HINT_ID}>
				For example, https://www.example.org/
			</p>
			<FieldError id={ERROR_ID} message={error} />
		</div>
	);
}
