"use client";

import { type ReactNode, useState } from "react";
import { focusAfterDeletion } from "@/lib/history/focus-after-deletion";
import {
	type Deletion,
	HistoryAnnouncerContext,
} from "./history-announcer-context";

type HistoryAnnouncerProps = {
	focusTargetId: string;
	children: ReactNode;
};

export function HistoryAnnouncer({
	focusTargetId,
	children,
}: HistoryAnnouncerProps) {
	const [message, setMessage] = useState("");
	const announce = ({ scanId, message: text }: Deletion) => {
		setMessage(text);
		focusAfterDeletion({ scanId, fallbackId: focusTargetId });
	};
	return (
		<HistoryAnnouncerContext value={announce}>
			{children}
			<p className="sr-only" role="status">
				{message}
			</p>
		</HistoryAnnouncerContext>
	);
}
