"use client";

import { useOrganization } from "@clerk/nextjs";
import Image from "next/image";

const LOGO_SIZE = 20;

export function OrganizationBadge() {
	const { organization } = useOrganization();
	if (!organization) {
		return null;
	}
	return (
		<p className="flex min-w-0 items-center gap-2 rounded-md border border-hud-frame px-2 py-1 text-sm">
			<Image
				alt=""
				className="size-5 shrink-0 rounded-sm"
				height={LOGO_SIZE}
				src={organization.imageUrl}
				unoptimized
				width={LOGO_SIZE}
			/>
			<span className="sr-only">Organization: </span>
			<span className="max-w-40 truncate font-medium">{organization.name}</span>
		</p>
	);
}
