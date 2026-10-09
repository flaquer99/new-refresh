import "server-only";

export const readCallbackToken = (): string | null =>
	process.env.SCAN_CALLBACK_TOKEN || null;
