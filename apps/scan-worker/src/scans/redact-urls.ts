// Matches an absolute http(s) URL up to whitespace, a quote, or an angle bracket
const ABSOLUTE_URL = /https?:\/\/[^\s"'<>]+/g;

const originAndPath = (url: string): string => {
  if (!URL.canParse(url)) {
    return url;
  }
  const { origin, pathname } = new URL(url);
  return `${origin}${pathname}`;
};

export const redactUrls = (text: string): string =>
  text.replace(ABSOLUTE_URL, originAndPath);

export const redactError = (error: unknown): unknown => {
  if (!(error instanceof Error)) {
    return redactUrls(String(error));
  }
  const redacted = new Error(redactUrls(error.message));
  redacted.name = error.name;
  redacted.stack = error.stack && redactUrls(error.stack);
  return redacted;
};
