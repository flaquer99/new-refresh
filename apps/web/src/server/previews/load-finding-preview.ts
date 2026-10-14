import "server-only";
import type { FindingPreview } from "@refresh/scan-contracts/preview-ui";
import type { ScanActor } from "../auth/get-scan-actor";
import { getScanStore } from "../db/scan-store";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "../scans/error-response";
import { scanNotFound } from "../scans/scan-not-found";
import { buildPreviewDocument } from "./build-preview-document";
import { type Finding, findFinding } from "./find-finding";
import {
	type PreviewPageOutcome,
	requestPreviewPage,
} from "./request-preview-page";

const FINDING_NOT_FOUND_MESSAGE =
	"This finding doesn't exist. The scan may have been deleted.";

export type LoadFindingPreviewParams = {
	scanId: string;
	findingId: string;
	actor: ScanActor;
};

const findingNotFound = (): Response =>
	errorResponse("FINDING_NOT_FOUND", FINDING_NOT_FOUND_MESSAGE);

const toPreview = (
	outcome: Exclude<PreviewPageOutcome, { kind: "worker-error" }>,
	finding: Finding,
): FindingPreview => {
	if (outcome.kind === "unavailable") {
		return { ...outcome, pageUrl: finding.pageUrl };
	}
	const token = crypto.randomUUID();
	const document = buildPreviewDocument(outcome.html, {
		finalUrl: outcome.finalUrl,
		selector: finding.selector,
		token,
	});
	return {
		kind: "loaded",
		pageUrl: finding.pageUrl,
		finalUrl: outcome.finalUrl,
		document,
		token,
	};
};

export const loadFindingPreview = async ({
	scanId,
	findingId,
	actor,
}: LoadFindingPreviewParams): Promise<Response> => {
	const stored = await getScanStore().get({
		scanId,
		organizationId: actor.organizationId,
	});
	if (!stored) {
		return scanNotFound();
	}
	const finding = stored.report && findFinding(stored.report, findingId);
	if (!finding) {
		return findingNotFound();
	}
	const outcome = await requestPreviewPage({
		pageUrl: finding.pageUrl,
		clientId: actor.userId,
	});
	if (outcome.kind === "worker-error") {
		logServerEvent("warn", { event: "preview.worker_unavailable" });
		return outcome.response;
	}
	return Response.json(toPreview(outcome, finding));
};
