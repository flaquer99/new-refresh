"use client";

import { type ReactNode, useState } from "react";
import { HistoryAnnouncerContext } from "./history-announcer-context";

type HistoryAnnouncerProps = {
	focusTargetId: string;
	children: ReactNode;
};

export function HistoryAnnouncer({
	focusTargetId,
	children,
}: HistoryAnnouncerProps) {
	const [message, setMessage] = useState("");
	const announce = (text: string) => {
		setMessage(text);
		document.getElementById(focusTargetId)?.focus();
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
