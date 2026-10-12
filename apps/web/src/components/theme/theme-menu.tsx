"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemePreference } from "@/hooks/use-theme-preference";
import {
	isThemePreference,
	THEME_ICONS,
	THEME_LABELS,
} from "@/lib/theme/theme-options";
import { ThemeMenuOptions } from "./theme-menu-options";

const MENU_LABEL = "Theme";

export function ThemeMenu() {
	const { preference, setPreference, isReady } = useThemePreference();
	const CurrentIcon = THEME_ICONS[preference];
	const triggerName = isReady
		? `${MENU_LABEL}: ${THEME_LABELS[preference]}`
		: MENU_LABEL;
	const handleChange = (value: string) => {
		if (isThemePreference(value)) {
			setPreference(value);
		}
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
				<CurrentIcon aria-hidden="true" />
				<span className="sr-only">{triggerName}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-auto">
				<ThemeMenuOptions
					label={MENU_LABEL}
					onChange={handleChange}
					preference={preference}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
