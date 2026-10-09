export const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";

export const VALID_SCAN_BODY = { url: "https://www.example.org/", depth: 1 };

export const RUNNING_STATUS = {
	scanId: SCAN_ID,
	status: "running",
	progress: {
		pagesScanned: 1,
		pagesDiscovered: 3,
		currentUrl: "https://www.example.org/a",
	},
	report: null,
	error: null,
};

export const startScanRequest = (
	body: unknown,
	headers: Record<string, string> = {},
): Request =>
	new Request("http://localhost/api/scans", {
		method: "POST",
		headers: { "content-type": "application/json", ...headers },
		body: typeof body === "string" ? body : JSON.stringify(body),
	});

export const scanRequest = (
	method: "GET" | "DELETE",
	headers: Record<string, string> = {},
): Request =>
	new Request(`http://localhost/api/scans/${SCAN_ID}`, { method, headers });

export const scanRouteContext = (id: string) => ({
	params: Promise.resolve({ id }),
});
