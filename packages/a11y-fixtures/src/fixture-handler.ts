import { readFile } from "node:fs/promises";
import type { RequestListener, ServerResponse } from "node:http";
import { contentTypeFor, HTML_CONTENT_TYPE } from "./content-type.js";
import { renderLargeSitePage } from "./large-site.js";
import { resolveFixturePath } from "./resolve-fixture-path.js";

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const CROSS_ORIGIN_PLACEHOLDER = "{{CROSS_ORIGIN}}";
const REQUEST_URL_BASE = "http://fixtures.invalid";
const NOT_FOUND_HTML =
  '<!doctype html><html lang="en"><head><title>Not found</title></head><body><main><h1>Not found</h1></main></body></html>';

export type FixtureHandlerOptions = {
  sitesDir: string;
  crossOrigin: () => string;
};

const send = (res: ServerResponse, contentType: string, body: Buffer) => {
  res.writeHead(HTTP_OK, { "content-type": contentType });
  res.end(body);
};

const sendNotFound = (res: ServerResponse) => {
  res.writeHead(HTTP_NOT_FOUND, { "content-type": HTML_CONTENT_TYPE });
  res.end(NOT_FOUND_HTML);
};

const readOrNull = async (filePath: string): Promise<Buffer | null> => {
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
};

const withCrossOrigin = (body: Buffer, crossOrigin: string): Buffer =>
  Buffer.from(
    body.toString("utf8").replaceAll(CROSS_ORIGIN_PLACEHOLDER, crossOrigin),
  );

const serveFile = async (
  res: ServerResponse,
  filePath: string,
  crossOrigin: () => string,
) => {
  const body = await readOrNull(filePath);
  if (body === null) {
    sendNotFound(res);
    return;
  }
  const contentType = contentTypeFor(filePath);
  const isHtml = contentType === HTML_CONTENT_TYPE;
  send(res, contentType, isHtml ? withCrossOrigin(body, crossOrigin()) : body);
};

const requestPathname = (requestUrl = "/"): string | null =>
  URL.canParse(requestUrl, REQUEST_URL_BASE)
    ? new URL(requestUrl, REQUEST_URL_BASE).pathname
    : null;

export const createFixtureHandler =
  ({ sitesDir, crossOrigin }: FixtureHandlerOptions): RequestListener =>
  async (req, res) => {
    const pathname = requestPathname(req.url);
    if (pathname === null) {
      sendNotFound(res);
      return;
    }
    const generated = renderLargeSitePage(pathname);
    if (generated !== null) {
      send(res, HTML_CONTENT_TYPE, Buffer.from(generated));
      return;
    }
    const filePath = resolveFixturePath(sitesDir, pathname);
    if (filePath === null) {
      sendNotFound(res);
      return;
    }
    await serveFile(res, filePath, crossOrigin);
  };
