import { afterEach, beforeEach, inject } from "vitest";
import { createScanStore } from "../scan-store.js";
import type { ScanStore } from "../scan-store-types.js";
import { DATABASE_URL_KEY } from "./provided-context.js";
import { resetScans } from "./seed-scans.js";

export type TestStore = {
  store: () => ScanStore;
  databaseUrl: () => string;
};

export const useTestStore = (): TestStore => {
  let store: ScanStore | undefined;
  beforeEach(async () => {
    await resetScans(inject(DATABASE_URL_KEY));
    store = createScanStore({ databaseUrl: inject(DATABASE_URL_KEY) });
  });
  afterEach(async () => {
    await store?.close();
    store = undefined;
  });
  return {
    store: () => {
      if (store === undefined) {
        throw new Error("The test scan store is only open inside a test.");
      }
      return store;
    },
    databaseUrl: () => inject(DATABASE_URL_KEY),
  };
};
