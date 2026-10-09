export const RELAUNCH_RETRY_MS = 5000;

export type SupervisedBrowser = {
  on: (event: "disconnected", listener: () => void) => unknown;
  isConnected: () => boolean;
  close: () => Promise<void>;
};

type BrowserEvent = "browser.disconnected" | "browser.relaunched";

export type BrowserSupervisorLogger = {
  error: (details: { event: string; err?: unknown }, message: string) => void;
  info: (details: { event: BrowserEvent }, message: string) => void;
};

export type SuperviseBrowserInput<B extends SupervisedBrowser> = {
  launch: () => Promise<B>;
  logger: BrowserSupervisorLogger;
};

export type BrowserSupervisor<B extends SupervisedBrowser> = {
  current: () => B;
  isConnected: () => boolean;
  close: () => Promise<void>;
};

type SupervisorState<B extends SupervisedBrowser> = SuperviseBrowserInput<B> & {
  browser: B;
  closing: boolean;
  retry?: NodeJS.Timeout;
};

const adopt = <B extends SupervisedBrowser>(
  state: SupervisorState<B>,
  browser: B,
) => {
  state.browser = browser;
  browser.on("disconnected", () => handleDisconnect(state, browser));
};

const relaunch = async <B extends SupervisedBrowser>(
  state: SupervisorState<B>,
) => {
  try {
    const browser = await state.launch();
    if (state.closing) {
      await browser.close();
      return;
    }
    adopt(state, browser);
    state.logger.info({ event: "browser.relaunched" }, "browser.relaunched");
  } catch (err) {
    state.logger.error(
      { event: "browser.relaunch_failed", err },
      "browser.relaunch_failed",
    );
    state.retry = setTimeout(() => relaunch(state), RELAUNCH_RETRY_MS);
    state.retry.unref();
  }
};

function handleDisconnect<B extends SupervisedBrowser>(
  state: SupervisorState<B>,
  browser: B,
) {
  if (state.closing || state.browser !== browser) {
    return;
  }
  state.logger.error({ event: "browser.disconnected" }, "browser.disconnected");
  relaunch(state);
}

export const superviseBrowser = async <B extends SupervisedBrowser>(
  input: SuperviseBrowserInput<B>,
): Promise<BrowserSupervisor<B>> => {
  const browser = await input.launch();
  const state: SupervisorState<B> = { ...input, browser, closing: false };
  adopt(state, browser);
  return {
    current: () => state.browser,
    isConnected: () => state.browser.isConnected(),
    close: async () => {
      state.closing = true;
      clearTimeout(state.retry);
      await state.browser.close();
    },
  };
};
