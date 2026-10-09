import { startWorker } from "./bootstrap/start-worker.js";
import { stopOnSignals } from "./bootstrap/stop-on-signals.js";
import { loadConfig } from "./config.js";

const worker = await startWorker({ config: loadConfig(process.env) });
stopOnSignals({ stop: worker.stop, log: worker.app.log });
