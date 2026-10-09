export const RETRY_DELAYS_MS = [1000, 2000, 4000] as const;

export const ATTEMPT_TIMEOUT_MS = 5000;

export const waitFor = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
