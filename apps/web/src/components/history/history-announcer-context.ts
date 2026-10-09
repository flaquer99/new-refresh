"use client";

import { createContext } from "react";

export type Announce = (message: string) => void;

const ignoreAnnouncement: Announce = () => undefined;

export const HistoryAnnouncerContext =
	createContext<Announce>(ignoreAnnouncement);
