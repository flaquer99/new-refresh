import type { NextRequest } from "next/server";
import { handleClerkWebhook } from "@/server/clerk-webhooks/handle-clerk-webhook";

export async function POST(request: NextRequest): Promise<Response> {
	return await handleClerkWebhook(request);
}
