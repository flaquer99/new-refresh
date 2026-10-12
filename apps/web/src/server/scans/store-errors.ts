import "server-only";
import { errorNameOf, logServerEvent } from "../log/server-log";
import { errorResponse } from "./error-response";

export const STORE_UNAVAILABLE_MESSAGE =
	"Something went wrong on our side. Try again later.";

export const logStoreFailure = (operation: string, error: unknown): void => {
	logServerEvent("error", {
		event: "db.unavailable",
		operation,
		errorName: errorNameOf(error),
	});
};

export const withStoreErrors = async (
	operation: string,
	work: () => Promise<Response>,
): Promise<Response> => {
	try {
		return await work();
	} catch (error) {
		logStoreFailure(operation, error);
		return errorResponse("INTERNAL_ERROR", STORE_UNAVAILABLE_MESSAGE);
	}
};
