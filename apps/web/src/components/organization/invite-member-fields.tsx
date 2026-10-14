import { FieldError } from "@/components/scan/field-error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import {
	INVITE_ROLE_LABELS,
	INVITE_ROLES,
	MEMBER_ROLE,
} from "@/lib/organizations/invite-member-state";

const EMAIL_ID = "invite-email";
const EMAIL_ERROR_ID = "invite-email-error";
const ROLE_ID = "invite-role";

type InviteMemberFieldsProps = {
	fieldError: string | null;
};

export function InviteMemberFields({ fieldError }: InviteMemberFieldsProps) {
	const hasError = fieldError !== null;
	return (
		<>
			<Field data-invalid={hasError}>
				<FieldLabel htmlFor={EMAIL_ID}>Email address</FieldLabel>
				<Input
					aria-describedby={hasError ? EMAIL_ERROR_ID : undefined}
					aria-invalid={hasError}
					autoComplete="off"
					id={EMAIL_ID}
					name="email"
					required
					type="email"
				/>
				<FieldError id={EMAIL_ERROR_ID} message={fieldError} />
			</Field>
			<Field>
				<FieldLabel htmlFor={ROLE_ID}>Role</FieldLabel>
				<NativeSelect
					className="w-full"
					defaultValue={MEMBER_ROLE}
					id={ROLE_ID}
					name="role"
				>
					{INVITE_ROLES.map((role) => (
						<NativeSelectOption key={role} value={role}>
							{INVITE_ROLE_LABELS[role]}
						</NativeSelectOption>
					))}
				</NativeSelect>
			</Field>
		</>
	);
}
