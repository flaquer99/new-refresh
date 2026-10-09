import { resolve, sep } from "node:path";

const DIRECTORY_INDEX = "index.html";

const safeDecode = (pathname: string): string | null => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
};

export const resolveFixturePath = (
  sitesDir: string,
  pathname: string,
): string | null => {
  const decoded = safeDecode(pathname);
  if (decoded === null) {
    return null;
  }
  const withIndex = decoded.endsWith("/")
    ? `${decoded}${DIRECTORY_INDEX}`
    : decoded;
  const filePath = resolve(sitesDir, `.${withIndex}`);
  return filePath.startsWith(`${sitesDir}${sep}`) ? filePath : null;
};
