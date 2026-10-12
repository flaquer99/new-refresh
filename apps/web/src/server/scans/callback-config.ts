import "server-only";

const MIN_CALLBACK_TOKEN_LENGTH = 32;

export const readCallbackToken = (): string | null => {
	const token = process.env.SCAN_CALLBACK_TOKEN ?? "";
	return token.length >= MIN_CALLBACK_TOKEN_LENGTH ? token : null;
};
