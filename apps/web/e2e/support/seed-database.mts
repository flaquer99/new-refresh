import { randomUUID } from "node:crypto";
import { seedReportScan } from "@refresh/db/testing/seed-report-scan";
import {
	buildSeedHistory,
	deleteScans,
	seedScans,
} from "@refresh/db/testing/seed-scans";
import { buildPreviewReport } from "./preview-seed-report.mts";

const MINUTE_MS = 60_000;
const FUTURE_NEWEST = new Date("2100-01-01T00:00:00.000Z");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is not set; the E2E database did not start.");
}

const [command, ...args] = process.argv.slice(2);

if (command === "seed") {
	const [count, startUrl] = args;
	const scans = buildSeedHistory({
		count: Number(count),
		newest: FUTURE_NEWEST,
		stepMs: MINUTE_MS,
		startUrl: String(startUrl),
	});
	await seedScans(databaseUrl, scans);
	process.stdout.write(JSON.stringify(scans.map(({ scanId }) => scanId)));
}

if (command === "remove") {
	await deleteScans(databaseUrl, args);
}

if (command === "seed-preview") {
	const [fixtures, closed] = args;
	const scanId = randomUUID();
	const report = buildPreviewReport({
		fixtures: String(fixtures),
		closed: String(closed),
	});
	await seedReportScan(databaseUrl, { scanId, report });
	process.stdout.write(JSON.stringify(scanId));
}
