import type { WorkerServices } from "./worker-services.js";

export const INTERRUPT_BUDGET_MS = 10_000;

const settleWithin = (work: Promise<void>, ms: number): Promise<void> =>
  Promise.race([
    work,
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms).unref();
    }),
  ]);

export const stopServices = async (services: WorkerServices) => {
  await settleWithin(services.registry.interruptAll(), INTERRUPT_BUDGET_MS);
  await services.browser.close();
  await services.fetchClient.close();
  await services.guard.close();
};
