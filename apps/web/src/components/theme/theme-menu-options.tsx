"use client";

import {
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
	THEME_ICONS,
	THEME_LABELS,
	THEME_PREFERENCES,
	type ThemePreference,
} from "@/lib/theme/theme-options";

type ThemeMenuOptionsProps = {
	label: string;
	preference: ThemePreference;
	onChange: (value: string) => void;
};

export function ThemeMenuOptions({
	label,
	preference,
	onChange,
}: ThemeMenuOptionsProps) {
	return (
		<DropdownMenuRadioGroup
			aria-label={label}
			onValueChange={onChange}
			value={preference}
		>
			{THEME_PREFERENCES.map((option) => {
				const Icon = THEME_ICONS[option];
				return (
					<DropdownMenuRadioItem closeOnClick key={option} value={option}>
						<Icon aria-hidden="true" />
						{THEME_LABELS[option]}
					</DropdownMenuRadioItem>
				);
			})}
		</DropdownMenuRadioGroup>
	);
}
