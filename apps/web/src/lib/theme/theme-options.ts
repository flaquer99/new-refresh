import type { Icon } from "@phosphor-icons/react";
import { MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react/ssr";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const THEME_STORAGE_KEY = "refresh-theme";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export const RESOLVED_THEMES = ["light", "dark"];

export const THEME_LABELS: Record<ThemePreference, string> = {
	system: "System",
	light: "Light",
	dark: "Dark",
};

export const THEME_ICONS: Record<ThemePreference, Icon> = {
	system: MonitorIcon,
	light: SunIcon,
	dark: MoonIcon,
};

export function isThemePreference(value: unknown): value is ThemePreference {
	return THEME_PREFERENCES.some((preference) => preference === value);
}
