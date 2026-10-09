type LoggedRequest = { method: string; url: string };

const pathOnly = (url: string): string => url.split("?", 1)[0] ?? url;

export const loggerOptions = (level: string) => ({
  level,
  serializers: {
    req: ({ method, url }: LoggedRequest): LoggedRequest => ({
      method,
      url: pathOnly(url),
    }),
  },
});
