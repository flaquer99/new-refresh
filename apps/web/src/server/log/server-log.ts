import "server-only";

export type ServerLogLevel = "warn" | "error";

export type ServerLogEvent = { event: string } & Record<string, unknown>;

export const logServerEvent = (
	level: ServerLogLevel,
	details: ServerLogEvent,
): void => {
	const line = JSON.stringify({
		level,
		time: new Date().toISOString(),
		...details,
	});
	process.stderr.write(`${line}\n`);
};

export const errorNameOf = (error: unknown): string =>
	error instanceof Error ? error.name : "Error";
