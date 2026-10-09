type FieldErrorProps = {
	id: string;
	message: string | null;
};

export function FieldError({ id, message }: FieldErrorProps) {
	if (message === null) {
		return null;
	}
	return (
		<p className="text-destructive text-sm" id={id} role="alert">
			{message}
		</p>
	);
}
