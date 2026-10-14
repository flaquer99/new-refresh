const RATE_LIMITED_STATUS = 429;
const DUPLICATE_RECORD_CODE = "duplicate_record";

type ClerkErrorShape = {
	status?: number;
	errors?: { code?: string }[];
};

export const isDuplicateInvitation = (error: unknown): boolean =>
	(error as ClerkErrorShape | null)?.errors?.[0]?.code ===
	DUPLICATE_RECORD_CODE;

export const isRateLimited = (error: unknown): boolean =>
	(error as ClerkErrorShape | null)?.status === RATE_LIMITED_STATUS;
