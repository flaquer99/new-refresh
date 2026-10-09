export const ANONYMOUS_CLIENT_ID = "anonymous";

const firstForwardedIp = (headers: Headers): string => {
	const forwardedFor = headers.get("x-forwarded-for") ?? "";
	return forwardedFor.split(",")[0].trim();
};

const realIp = (headers: Headers): string =>
	headers.get("x-real-ip")?.trim() ?? "";

export const resolveClientId = (headers: Headers): string =>
	firstForwardedIp(headers) || realIp(headers) || ANONYMOUS_CLIENT_ID;
