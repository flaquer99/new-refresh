import type { Response } from "undici";

export type CappedBytes = { bytes: Uint8Array; truncated: boolean };

export const readCappedBytes = async (
  response: Response,
  maxBytes: number,
): Promise<CappedBytes> => {
  if (!response.body) {
    return { bytes: new Uint8Array(), truncated: false };
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of response.body) {
    chunks.push(chunk);
    total += chunk.byteLength;
    if (total > maxBytes) {
      break;
    }
  }
  return {
    bytes: Buffer.concat(chunks).subarray(0, maxBytes),
    truncated: total > maxBytes,
  };
};
