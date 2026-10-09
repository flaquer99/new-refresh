export const normalizeUrl = (url: string): string => {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.href;
};

export const isSameOrigin = (left: string, right: string): boolean =>
  new URL(left).origin === new URL(right).origin;
