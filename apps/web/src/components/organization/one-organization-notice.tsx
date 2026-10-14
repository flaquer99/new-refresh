import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/auth/auth-paths";

export const ONE_ORGANIZATION_MESSAGE =
	"You already belong to an organization. A person can only belong to one organization, so this invitation cannot be accepted. Leave your current organization first if you want to join another.";

export function OneOrganizationNotice() {
	return (
		<section className="hud-frame flex w-full max-w-xl flex-col gap-4 rounded-md bg-card p-4 text-card-foreground sm:p-6">
			<h2 className="font-semibold text-lg">Invitation can't be accepted</h2>
			<p>{ONE_ORGANIZATION_MESSAGE}</p>
			<Link
				className={buttonVariants({ className: "self-start" })}
				href={HOME_PATH}
			>
				Go to refresh
			</Link>
		</section>
	);
}
