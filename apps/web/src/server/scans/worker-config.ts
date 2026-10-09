import "server-only";

const DEFAULT_WORKER_URL = "http://127.0.0.1:3001";

export type WorkerConfig = {
	url: string;
	token: string;
};

export const readWorkerConfig = (): WorkerConfig | null => {
	const token = process.env.SCAN_WORKER_TOKEN;
	if (!token) {
		return null;
	}
	return { url: process.env.SCAN_WORKER_URL || DEFAULT_WORKER_URL, token };
};
