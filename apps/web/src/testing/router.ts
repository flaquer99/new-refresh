import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { type Mock, vi } from "vitest";

export type RouterMock = { push: Mock; refresh: Mock };

export const mockRouter = (): RouterMock => {
	const router = { push: vi.fn(), refresh: vi.fn() };
	vi.mocked(useRouter).mockReturnValue(router as unknown as AppRouterInstance);
	return router;
};
