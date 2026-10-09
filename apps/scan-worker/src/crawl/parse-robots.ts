import { createRequire } from "node:module";
import type robotsParserModule from "robots-parser";

type ParseRobots = typeof robotsParserModule.default;

const require = createRequire(import.meta.url);

export const parseRobots: ParseRobots = require("robots-parser");
