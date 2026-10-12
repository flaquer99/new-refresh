"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import {
	DEFAULT_THEME_PREFERENCE,
	RESOLVED_THEMES,
	THEME_STORAGE_KEY,
} from "@/lib/theme/theme-options";

type ThemeProviderProps = {
	children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme={DEFAULT_THEME_PREFERENCE}
			disableTransitionOnChange
			enableColorScheme
			enableSystem
			storageKey={THEME_STORAGE_KEY}
			themes={RESOLVED_THEMES}
		>
			{children}
		</NextThemesProvider>
	);
}
