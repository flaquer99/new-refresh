import {
	ErrorEnvelopeSchema,
	type ScanError,
} from "@refresh/scan-contracts/errors";
import type { z } from "zod";

export type ApiResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: ScanError };

type RequestJsonParams<T> = {
	path: string;
	init: RequestInit;
	schema: z.ZodType<T>;
};

const SERVICE_UNAVAILABLE: ScanError = {
	code: "WORKER_UNAVAILABLE",
	message: "We couldn't reach the scan service. Try again in a moment.",
};

const UNEXPECTED_RESPONSE: ScanError = {
	code: "INTERNAL_ERROR",
	message: "Something went wrong on our side. Try again in a moment.",
};

const readBody = async (response: Response): Promise<unknown> => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

const toResult = <T>(
	response: Response,
	body: unknown,
	schema: z.ZodType<T>,
): ApiResult<T> => {
	if (response.ok) {
		const parsed = schema.safeParse(body);
		return parsed.success
			? { ok: true, data: parsed.data }
			: { ok: false, error: UNEXPECTED_RESPONSE };
	}
	const envelope = ErrorEnvelopeSchema.safeParse(body);
	return {
		ok: false,
		error: envelope.success ? envelope.data.error : UNEXPECTED_RESPONSE,
	};
};

export const requestJson = async <T>({
	path,
	init,
	schema,
}: RequestJsonParams<T>): Promise<ApiResult<T>> => {
	let response: Response;
	try {
		response = await fetch(path, init);
	} catch {
		return { ok: false, error: SERVICE_UNAVAILABLE };
	}
	return toResult(response, await readBody(response), schema);
};
