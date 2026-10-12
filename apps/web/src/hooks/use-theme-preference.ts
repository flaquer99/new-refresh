"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
	DEFAULT_THEME_PREFERENCE,
	isThemePreference,
	type ThemePreference,
} from "@/lib/theme/theme-options";

type ThemePreferenceState = {
	preference: ThemePreference;
	setPreference: (next: ThemePreference) => void;
	isReady: boolean;
};

const subscribeToNothing = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useThemePreference(): ThemePreferenceState {
	const { theme, setTheme } = useTheme();
	const isReady = useSyncExternalStore(
		subscribeToNothing,
		getClientSnapshot,
		getServerSnapshot,
	);
	const preference =
		isReady && isThemePreference(theme) ? theme : DEFAULT_THEME_PREFERENCE;
	return { preference, setPreference: setTheme, isReady };
}
