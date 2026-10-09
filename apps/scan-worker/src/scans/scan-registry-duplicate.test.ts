import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REGISTRY_REQUEST,
  REGISTRY_SCAN_ID,
  startRegistryScan,
} from "../testing/registry-harness.js";
import { ScanIdTakenError } from "./scan-id-taken-error.js";

describe("ScanRegistry scan ids", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects a scan id that is already tracked", () => {
    // GIVEN
    const { registry } = startRegistryScan();

    // WHEN
    const creating = () =>
      registry.create({
        scanId: REGISTRY_SCAN_ID,
        request: REGISTRY_REQUEST,
        clientId: "bob",
      });

    // THEN
    expect(creating).toThrowError(ScanIdTakenError);
  });

  it("does not reserve a slot for a rejected duplicate id", () => {
    // GIVEN
    const { registry } = startRegistryScan();
    const duplicate = {
      scanId: REGISTRY_SCAN_ID,
      request: REGISTRY_REQUEST,
      clientId: "bob",
    };
    expect(() => registry.create(duplicate)).toThrowError(ScanIdTakenError);

    // WHEN
    const active = registry.activeCount();

    // THEN
    expect(active).toBe(1);
  });
});
