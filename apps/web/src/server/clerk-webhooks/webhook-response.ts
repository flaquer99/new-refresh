const INVALID_WEBHOOK_STATUS = 400;
const INTERNAL_ERROR_STATUS = 500;
const INVALID_WEBHOOK_MESSAGE = "Invalid webhook signature.";
const INTERNAL_ERROR_MESSAGE = "Webhook processing failed.";

export const handledResponse = (handled: boolean): Response =>
	Response.json({ handled });

export const invalidWebhookResponse = (): Response =>
	Response.json(
		{ error: { code: "INVALID_WEBHOOK", message: INVALID_WEBHOOK_MESSAGE } },
		{ status: INVALID_WEBHOOK_STATUS },
	);

export const webhookFailureResponse = (): Response =>
	Response.json(
		{ error: { code: "INTERNAL_ERROR", message: INTERNAL_ERROR_MESSAGE } },
		{ status: INTERNAL_ERROR_STATUS },
	);
