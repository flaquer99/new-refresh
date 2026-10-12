import { startTestDatabase } from "@refresh/db/testing/test-database";

const KEEP_ALIVE_MS = 2 ** 30;

const database = await startTestDatabase();
const keepAlive = setInterval(() => undefined, KEEP_ALIVE_MS);
process.stdout.write(`DATABASE_URL=${database.url}\n`);

const stop = async () => {
	clearInterval(keepAlive);
	await database.stop();
	process.exit(0);
};

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
