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
				"rounded-md px-2 py-1 font-medium underline-offset-4 hover:underline",
				isCurrent && "underline",
			)}
			href={href}
		>
			{label}
		</Link>
	);
}
