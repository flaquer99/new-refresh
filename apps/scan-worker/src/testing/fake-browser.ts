import { EventEmitter } from "node:events";
import { vi } from "vitest";

export class FakeBrowser extends EventEmitter {
  connected = true;

  readonly close = vi.fn(() => {
    this.crash();
    return Promise.resolve();
  });

  isConnected(): boolean {
    return this.connected;
  }

  crash() {
    this.connected = false;
    this.emit("disconnected", this);
  }
}

export const fakeLauncher = () => {
  const launched: FakeBrowser[] = [];
  const launch = vi.fn(() => {
    const browser = new FakeBrowser();
    launched.push(browser);
    return Promise.resolve(browser);
  });
  return { launch, launched };
};
