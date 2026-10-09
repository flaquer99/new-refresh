import { serveFixtures } from "@refresh/a11y-fixtures/serve-fixtures";

const port = Number(process.env.E2E_FIXTURES_PORT);
const fixtures = await serveFixtures({ port });

const stop = async () => {
	await fixtures.close();
	process.exit(0);
};

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
