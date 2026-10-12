import { HudPanel } from "@/components/hud/hud-panel";
import { Badge } from "@/components/ui/badge";

const HERO_HEADING_ID = "home-hero-heading";
const HERO_CHIPS = [
	"Whole site",
	"WCAG 2.2 A and AA",
	"Desktop and mobile",
] as const;

export function HomeHero() {
	return (
		<HudPanel labelledBy={HERO_HEADING_ID} title="Accessibility scanner">
			<h1 className="font-semibold text-3xl" id={HERO_HEADING_ID}>
				WCAG 2.2 accessibility scan
			</h1>
			<p className="text-muted-foreground">
				Check a website against the WCAG 2.2 Level A and AA success criteria and
				get plain-language guidance for every issue found.
			</p>
			<ul className="flex flex-wrap gap-2">
				{HERO_CHIPS.map((chip) => (
					<li key={chip}>
						<Badge variant="outline">{chip}</Badge>
					</li>
				))}
			</ul>
		</HudPanel>
	);
}
