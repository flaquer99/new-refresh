import { requireApiActor } from "@/server/auth/require-api-actor";
import { loadFindingPreview } from "@/server/previews/load-finding-preview";
import { withStoreErrors } from "@/server/scans/store-errors";

export async function GET(
	_request: Request,
	context: RouteContext<"/api/scans/[id]/findings/[findingId]/preview">,
): Promise<Response> {
	const auth = await requireApiActor();
	if (!auth.ok) {
		return auth.response;
	}
	const { id, findingId } = await context.params;
	const response = await withStoreErrors("loadFindingPreview", () =>
		loadFindingPreview({ scanId: id, findingId, actor: auth.actor }),
	);
	response.headers.set("cache-control", "no-store");
	return response;
}
