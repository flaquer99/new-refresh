import "server-only";
import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { errorNameOf, logServerEvent } from "../log/server-log";
import { enforceSingleMembership } from "./enforce-single-membership";
import { purgeOrganizationScans } from "./purge-organization-scans";
import {
	handledResponse,
	invalidWebhookResponse,
	webhookFailureResponse,
} from "./webhook-response";

const SVIX_ID_HEADER = "svix-id";

const dispatch = async (event: WebhookEvent): Promise<boolean> => {
	if (event.type === "organizationMembership.created") {
		await enforceSingleMembership(event.data.public_user_data.user_id);
		return true;
	}
	if (event.type === "organization.deleted" && event.data.id) {
		await purgeOrganizationScans(event.data.id);
		return true;
	}
	return false;
};

const verify = async (request: NextRequest): Promise<WebhookEvent | null> => {
	try {
		return await verifyWebhook(request);
	} catch (error) {
		logServerEvent("warn", {
			event: "webhook.invalid_signature",
			svixId: request.headers.get(SVIX_ID_HEADER),
			errorName: errorNameOf(error),
		});
		return null;
	}
};

export const handleClerkWebhook = async (
	request: NextRequest,
): Promise<Response> => {
	const event = await verify(request);
	if (!event) {
		return invalidWebhookResponse();
	}
	try {
		return handledResponse(await dispatch(event));
	} catch (error) {
		logServerEvent("error", {
			event: "webhook.failed",
			type: event.type,
			svixId: request.headers.get(SVIX_ID_HEADER),
			errorName: errorNameOf(error),
		});
		return webhookFailureResponse();
	}
};
