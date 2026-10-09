export const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, ms);
    signal.addEventListener("abort", finish, { once: true });
  });

export const ABORTED = Symbol("aborted");

const whenAborted = (signal: AbortSignal, cleanup: AbortSignal) =>
  new Promise<typeof ABORTED>((resolve) => {
    const options = { once: true, signal: cleanup };
    signal.addEventListener("abort", () => resolve(ABORTED), options);
  });

export const raceAbort = async <T>(
  work: Promise<T>,
  signal: AbortSignal,
): Promise<T | typeof ABORTED> => {
  const cleanup = new AbortController();
  try {
    return await Promise.race([work, whenAborted(signal, cleanup.signal)]);
  } finally {
    cleanup.abort();
  }
};
