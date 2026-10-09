import { extname } from "node:path";

export const HTML_CONTENT_TYPE = "text/html; charset=utf-8";

const DEFAULT_CONTENT_TYPE = "application/octet-stream";

const CONTENT_TYPES: Record<string, string> = {
  ".html": HTML_CONTENT_TYPE,
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

export const contentTypeFor = (filePath: string): string =>
  CONTENT_TYPES[extname(filePath)] ?? DEFAULT_CONTENT_TYPE;
