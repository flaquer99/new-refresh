"use client";

import { UserButton } from "@clerk/nextjs";
import { Buildings } from "@phosphor-icons/react";
import { ACCOUNT_PATH, ORGANIZATION_PATH } from "@/lib/auth/auth-paths";

export function UserMenu() {
	return (
		<UserButton userProfileMode="navigation" userProfileUrl={ACCOUNT_PATH}>
			<UserButton.MenuItems>
				<UserButton.Link
					href={ORGANIZATION_PATH}
					label="Organization settings"
					labelIcon={<Buildings aria-hidden="true" size={16} />}
				/>
			</UserButton.MenuItems>
		</UserButton>
	);
}
