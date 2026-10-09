import { isIP } from "node:net";
import { stripBrackets } from "../network/resolve-host.js";

export const stubResolver =
  (table: Readonly<Record<string, string[]>> = {}) =>
  (host: string): Promise<string[]> => {
    const bare = stripBrackets(host);
    const fallback = isIP(bare) ? [bare] : [];
    return Promise.resolve(table[bare] ?? fallback);
  };
