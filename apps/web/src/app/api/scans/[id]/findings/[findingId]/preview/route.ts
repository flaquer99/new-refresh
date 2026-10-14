import { loadFindingPreview } from "@/server/previews/load-finding-preview";
import { resolveClientId } from "@/server/scans/client-id";
import { withStoreErrors } from "@/server/scans/store-errors";

export async function GET(
	request: Request,
	context: RouteContext<"/api/scans/[id]/findings/[findingId]/preview">,
): Promise<Response> {
	const { id, findingId } = await context.params;
	const response = await withStoreErrors("loadFindingPreview", () =>
		loadFindingPreview({
			scanId: id,
			findingId,
			clientId: resolveClientId(request.headers),
		}),
	);
	response.headers.set("cache-control", "no-store");
	return response;
}
