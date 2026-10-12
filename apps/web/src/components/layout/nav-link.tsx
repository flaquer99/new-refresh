"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
	href: string;
	label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
	const isCurrent = usePathname() === href;
	return (
		<Link
			aria-current={isCurrent ? "page" : undefined}
			className={cn(
				"rounded-md border border-transparent px-2 py-1 font-medium text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline",
				isCurrent && "border-hud-frame text-foreground underline",
			)}
			href={href}
		>
			{label}
		</Link>
	);
}
