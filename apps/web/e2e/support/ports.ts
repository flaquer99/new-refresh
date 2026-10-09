export const LOOPBACK_HOST = "127.0.0.1";
const DEFAULT_WEB_PORT = 3090;
const DEFAULT_WORKER_PORT = 3091;
const DEFAULT_FIXTURES_PORT = 3092;
const DEFAULT_CLOSED_PORT = 3093;

const portFrom = (name: string, fallback: number): number =>
	Number(process.env[name] ?? fallback);

export const WEB_PORT = portFrom("E2E_WEB_PORT", DEFAULT_WEB_PORT);
export const WORKER_PORT = portFrom("E2E_WORKER_PORT", DEFAULT_WORKER_PORT);
export const FIXTURES_PORT = portFrom(
	"E2E_FIXTURES_PORT",
	DEFAULT_FIXTURES_PORT,
);
export const CLOSED_PORT = portFrom("E2E_CLOSED_PORT", DEFAULT_CLOSED_PORT);

export const hostPort = (port: number): string => `${LOOPBACK_HOST}:${port}`;

export const originOf = (port: number): string => `http://${hostPort(port)}`;

export const WEB_ORIGIN = originOf(WEB_PORT);
export const WORKER_ORIGIN = originOf(WORKER_PORT);
export const FIXTURES_ORIGIN = originOf(FIXTURES_PORT);
export const CLOSED_ORIGIN = originOf(CLOSED_PORT);

export const fixtureUrl = (path: string): string => `${FIXTURES_ORIGIN}${path}`;
