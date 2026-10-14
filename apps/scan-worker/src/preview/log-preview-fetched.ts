import type { PreviewFetchResult } from "@refresh/scan-contracts/preview";

export type PreviewFetchedLog = {
  event: "preview.fetched";
  clientIdHash: string | null;
  host: string;
  outcome: string;
  httpStatus: number | null;
  bytes: number;
  durationMs: number;
};

export type PreviewLogger = {
  info: (details: PreviewFetchedLog, message: string) => void;
};

export type LogPreviewFetchedInput = {
  result: PreviewFetchResult;
  bytes: number;
  durationMs: number;
  url: string;
  logger: PreviewLogger;
  clientIdHash?: string;
};

export const logPreviewFetched = ({
  result,
  bytes,
  durationMs,
  url,
  logger,
  clientIdHash,
}: LogPreviewFetchedInput) => {
  const refused = result.kind === "unavailable";
  logger.info(
    {
      event: "preview.fetched",
      clientIdHash: clientIdHash ?? null,
      host: new URL(url).host,
      outcome: refused ? result.reason : "loaded",
      httpStatus: refused ? result.httpStatus : null,
      bytes,
      durationMs,
    },
    "preview.fetched",
  );
};
