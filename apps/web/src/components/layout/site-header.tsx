import { HISTORY_PATH, NEW_SCAN_PATH } from "@/lib/scans/scan-links";
import { NavLink } from "./nav-link";

const NAV_LINKS = [
	{ href: NEW_SCAN_PATH, label: "New scan" },
	{ href: HISTORY_PATH, label: "Scan history" },
] as const;

export function SiteHeader() {
	return (
		<header className="border-border border-b">
			<div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
				<p className="font-semibold">Refresh</p>
				<nav aria-label="Main">
					<ul className="flex flex-wrap gap-2">
						{NAV_LINKS.map(({ href, label }) => (
							<li key={href}>
								<NavLink href={href} label={label} />
							</li>
						))}
					</ul>
				</nav>
			</div>
		</header>
	);
}
