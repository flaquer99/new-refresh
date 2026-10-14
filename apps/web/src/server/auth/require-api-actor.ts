import "server-only";
import { errorResponse } from "../scans/error-response";
import {
	ORGANIZATION_REQUIRED_MESSAGE,
	UNAUTHORIZED_MESSAGE,
} from "./auth-constants";
import {
	type ActorFailureCode,
	getScanActor,
	type ScanActor,
} from "./get-scan-actor";

export type ApiActorResult =
	| { ok: true; actor: ScanActor }
	| { ok: false; response: Response };

const FAILURE_MESSAGES: Record<ActorFailureCode, string> = {
	UNAUTHORIZED: UNAUTHORIZED_MESSAGE,
	ORGANIZATION_REQUIRED: ORGANIZATION_REQUIRED_MESSAGE,
};

export const requireApiActor = async (): Promise<ApiActorResult> => {
	const result = await getScanActor();
	if (result.ok) {
		return result;
	}
	return {
		ok: false,
		response: errorResponse(result.code, FAILURE_MESSAGES[result.code]),
	};
};
