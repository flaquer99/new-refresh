"use client";

import { createContext } from "react";

export type Deletion = {
	scanId: string;
	message: string;
};

export type AnnounceDeletion = (deletion: Deletion) => void;

const ignoreAnnouncement: AnnounceDeletion = () => undefined;

export const HistoryAnnouncerContext =
	createContext<AnnounceDeletion>(ignoreAnnouncement);
