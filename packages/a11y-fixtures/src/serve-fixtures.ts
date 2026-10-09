import { fileURLToPath } from "node:url";
import { createFixtureHandler } from "./fixture-handler.js";
import { type ListeningServer, listen } from "./listen.js";

const SITES_DIR = fileURLToPath(new URL("../sites", import.meta.url));
const EPHEMERAL_PORT = 0;

export type ServeFixturesOptions = {
  port: number;
  crossOriginPort?: number;
};

export type FixtureServer = {
  origin: string;
  crossOrigin: string;
  close: () => Promise<void>;
};

const listenWithCrossOrigin = (
  port: number,
  crossOrigin: () => string,
): Promise<ListeningServer> =>
  listen(createFixtureHandler({ sitesDir: SITES_DIR, crossOrigin }), port);

const closeOnFailure = async <T>(
  starting: Promise<T>,
  started: ListeningServer,
): Promise<T> => {
  try {
    return await starting;
  } catch (error) {
    await started.close();
    throw error;
  }
};

export const serveFixtures = async ({
  port,
  crossOriginPort = EPHEMERAL_PORT,
}: ServeFixturesOptions): Promise<FixtureServer> => {
  const origins = { primary: "", secondary: "" };
  const primary = await listenWithCrossOrigin(port, () => origins.secondary);
  const secondary = await closeOnFailure(
    listenWithCrossOrigin(crossOriginPort, () => origins.primary),
    primary,
  );
  origins.primary = primary.origin;
  origins.secondary = secondary.origin;
  return {
    origin: primary.origin,
    crossOrigin: secondary.origin,
    close: async () => {
      await Promise.all([primary.close(), secondary.close()]);
    },
  };
};
