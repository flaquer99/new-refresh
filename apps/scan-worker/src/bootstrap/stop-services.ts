import type { WorkerServices } from "./worker-services.js";

export const INTERRUPT_BUDGET_MS = 10_000;

const settleWithin = async (work: Promise<void>, ms: number) => {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  try {
    await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
};

export const stopServices = async (services: WorkerServices) => {
  await settleWithin(services.registry.interruptAll(), INTERRUPT_BUDGET_MS);
  services.deliveries.abort();
  await services.browser.close();
  await services.fetchClient.close();
  await services.guard.close();
};
