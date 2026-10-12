import { z } from "zod";

const SEPARATOR = "|";
const CURSOR_PARTS = 2;

const CursorSchema = z.object({
  startedAt: z.iso.datetime(),
  id: z.uuid(),
});

export type HistoryCursor = { startedAt: Date; id: string };

export const encodeCursor = ({ startedAt, id }: HistoryCursor): string =>
  Buffer.from(`${startedAt.toISOString()}${SEPARATOR}${id}`).toString(
    "base64url",
  );

export const decodeCursor = (value: string): HistoryCursor | null => {
  const parts = Buffer.from(value, "base64url")
    .toString("utf8")
    .split(SEPARATOR);
  if (parts.length !== CURSOR_PARTS) {
    return null;
  }
  const [startedAt, id] = parts;
  const parsed = CursorSchema.safeParse({ startedAt, id });
  if (!parsed.success) {
    return null;
  }
  return { startedAt: new Date(parsed.data.startedAt), id: parsed.data.id };
};
