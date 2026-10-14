import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Public_Sans } from "next/font/google";
import { HudBackdrop } from "@/components/layout/hud-backdrop";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const publicSans = Public_Sans({
	variable: "--font-public-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Refresh — WCAG 2.2 accessibility scan",
		template: "%s — Refresh",
	},
	description:
		"Scan a website for WCAG 2.2 Level A and AA accessibility issues and get guidance on how to fix them.",
};

const CHOOSE_ORGANIZATION_TASK_URL = "/onboarding";
const AFTER_SIGN_OUT_URL = "/";
const LIGHT_THEME_COLOR = "#f6f8fb";
const DARK_THEME_COLOR = "#0a0f16";

export const viewport: Viewport = {
	colorScheme: "light dark",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: LIGHT_THEME_COLOR },
		{ media: "(prefers-color-scheme: dark)", color: DARK_THEME_COLOR },
	],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${publicSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col font-sans">
				<ClerkProvider
					afterSignOutUrl={AFTER_SIGN_OUT_URL}
					appearance={{ theme: shadcn }}
					taskUrls={{ "choose-organization": CHOOSE_ORGANIZATION_TASK_URL }}
				>
					<ThemeProvider>
						<SkipLink />
						<HudBackdrop />
						<SiteHeader />
						{children}
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
