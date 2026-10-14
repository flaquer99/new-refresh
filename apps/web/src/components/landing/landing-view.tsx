import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { HudPanel } from "@/components/hud/hud-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LANDING_HEADING_ID = "landing-heading";
const LANDING_CHIPS = [
	"Whole site",
	"WCAG 2.2 A and AA",
	"Desktop and mobile",
	"Shared with your organization",
] as const;

export function LandingView() {
	return (
		<HudPanel labelledBy={LANDING_HEADING_ID} title="Accessibility scanner">
			<h1 className="font-semibold text-3xl" id={LANDING_HEADING_ID}>
				Find WCAG 2.2 issues across your whole site
			</h1>
			<p className="text-muted-foreground">
				Refresh crawls a website, checks every page on desktop and mobile
				against the WCAG 2.2 Level A and AA criteria, and explains how to fix
				each issue. Sign in to scan, and share every report with your
				organization.
			</p>
			<ul className="flex flex-wrap gap-2">
				{LANDING_CHIPS.map((chip) => (
					<li key={chip}>
						<Badge variant="outline">{chip}</Badge>
					</li>
				))}
			</ul>
			<div className="flex flex-wrap gap-2">
				<SignUpButton>
					<Button size="lg">Sign up</Button>
				</SignUpButton>
				<SignInButton>
					<Button size="lg" variant="outline">
						Sign in
					</Button>
				</SignInButton>
			</div>
		</HudPanel>
	);
}
