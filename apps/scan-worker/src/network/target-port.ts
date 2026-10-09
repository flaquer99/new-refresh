const DEFAULT_PORTS: Readonly<Record<string, number>> = {
  "http:": 80,
  "https:": 443,
};

export const isWebUrl = (url: URL): boolean => url.protocol in DEFAULT_PORTS;

export const targetPort = (url: URL): number =>
  url.port === "" ? (DEFAULT_PORTS[url.protocol] ?? 0) : Number(url.port);

export const parseWebUrl = (raw: string): URL | null => {
  if (!URL.canParse(raw)) {
    return null;
  }
  const url = new URL(raw);
  return isWebUrl(url) ? url : null;
};
