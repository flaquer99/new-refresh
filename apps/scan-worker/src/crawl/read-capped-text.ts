import type { Response } from "undici";

const collectChunks = async (
  body: AsyncIterable<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array[]> => {
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of body) {
    chunks.push(chunk.subarray(0, maxBytes - total));
    total += chunk.byteLength;
    if (total >= maxBytes) {
      break;
    }
  }
  return chunks;
};

export const readCappedText = async (
  response: Response,
  maxBytes: number,
): Promise<string> => {
  if (!response.body) {
    return "";
  }
  const chunks = await collectChunks(response.body, maxBytes);
  return Buffer.concat(chunks).toString("utf8");
};
