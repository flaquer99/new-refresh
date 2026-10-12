import { createHash } from "node:crypto";

const HASH_ALGORITHM = "sha256";

export const scanIdFor = (index: number): string =>
  `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

export const scanIdFromSeed = (seed: string): string => {
  const hex = createHash(HASH_ALGORITHM).update(seed).digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
};
