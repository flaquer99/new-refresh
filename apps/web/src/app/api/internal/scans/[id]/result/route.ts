import { logServerEvent } from "@/server/log/server-log";
import { isAuthorizedCallback } from "@/server/scans/callback-auth";
import { errorResponse } from "@/server/scans/error-response";
import { recordCallback } from "@/server/scans/record-callback";
import { withStoreErrors } from "@/server/scans/store-errors";

const UNAUTHORIZED_MESSAGE = "Missing or invalid token.";

export async function POST(
	request: Request,
	context: RouteContext<"/api/internal/scans/[id]/result">,
): Promise<Response> {
	if (!isAuthorizedCallback(request.headers)) {
		logServerEvent("warn", { event: "callback.unauthorized" });
		return errorResponse("UNAUTHORIZED", UNAUTHORIZED_MESSAGE);
	}
	const { id } = await context.params;
	return await withStoreErrors("recordResult", () =>
		recordCallback(id, request),
	);
}
