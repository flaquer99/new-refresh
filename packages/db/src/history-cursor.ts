import { z } from "zod";

const SEPARATOR = "|";

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
  const [startedAt, id] = Buffer.from(value, "base64url")
    .toString("utf8")
    .split(SEPARATOR);
  const parsed = CursorSchema.safeParse({ startedAt, id });
  if (!parsed.success) {
    return null;
  }
  return { startedAt: new Date(parsed.data.startedAt), id: parsed.data.id };
};
