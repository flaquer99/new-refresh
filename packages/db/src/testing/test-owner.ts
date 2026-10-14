import type { ScanOwner } from "../scan-store-types.js";

export const TEST_ORGANIZATION_ID = "org_test_primary";
export const OTHER_ORGANIZATION_ID = "org_test_other";
export const TEST_USER_ID = "user_test_primary";
export const OTHER_USER_ID = "user_test_other";
export const TEST_USER_NAME = "Ana Souza";

export const TEST_OWNER: ScanOwner = {
  organizationId: TEST_ORGANIZATION_ID,
  startedByUserId: TEST_USER_ID,
  startedByName: TEST_USER_NAME,
};
