import { errorResponse } from "./error-response";

export const SCAN_NOT_FOUND_MESSAGE =
	"This scan doesn't exist. It may have been deleted.";

export const scanNotFound = (): Response =>
	errorResponse("SCAN_NOT_FOUND", SCAN_NOT_FOUND_MESSAGE);
