import type { Ref } from "react";
import { cn } from "@/lib/utils";

type UrlInputProps = {
	id: string;
	value: string;
	describedBy: string;
	hasError: boolean;
	ref: Ref<HTMLInputElement>;
	onChange: (value: string) => void;
	onBlur: () => void;
};

const inputClassName = (hasError: boolean): string =>
	cn(
		"w-full min-w-0 rounded-md border border-border bg-background px-3 py-2",
		hasError && "border-destructive",
	);

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
			<label className="font-medium" htmlFor={id}>
				Website address
			</label>
			<input
				aria-describedby={describedBy}
				aria-invalid={hasError}
				autoComplete="url"
				className={inputClassName(hasError)}
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
