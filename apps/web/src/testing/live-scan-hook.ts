import { renderHook } from "@testing-library/react";
import { useLiveScan } from "@/hooks/use-live-scan";

export const LIVE_SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";

export const renderLiveScan = () => renderHook(() => useLiveScan(LIVE_SCAN_ID));
