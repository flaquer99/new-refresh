import { Show } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth/auth-controls";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { HISTORY_PATH, NEW_SCAN_PATH } from "@/lib/scans/scan-links";
import { NavLink } from "./nav-link";
import { Wordmark } from "./wordmark";

const NAV_LINKS = [
	{ href: NEW_SCAN_PATH, label: "New scan" },
	{ href: HISTORY_PATH, label: "Scan history" },
] as const;

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-40 border-hud-frame border-b bg-background/90 backdrop-blur">
			<div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
				<Wordmark />
				<Show when="signed-in">
					<nav
						aria-label="Main"
						className="order-3 w-full sm:order-2 sm:w-auto"
					>
						<ul className="flex flex-wrap gap-1">
							{NAV_LINKS.map(({ href, label }) => (
								<li key={href}>
									<NavLink href={href} label={label} />
								</li>
							))}
						</ul>
					</nav>
				</Show>
				<div className="order-2 flex items-center gap-2 sm:order-3">
					<AuthControls />
					<ThemeMenu />
				</div>
			</div>
		</header>
	);
}
