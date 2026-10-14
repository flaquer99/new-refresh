import "server-only";
import { headers } from "next/headers";

const DEFAULT_PROTOCOL = "http";

export const getAppOrigin = async (): Promise<string> => {
	const requestHeaders = await headers();
	const host =
		requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
	const protocol = requestHeaders.get("x-forwarded-proto") ?? DEFAULT_PROTOCOL;
	return `${protocol}://${host}`;
};
