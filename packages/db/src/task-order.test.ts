import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const TURBO_BIN = fileURLToPath(
  new URL("../../../node_modules/.bin/turbo", import.meta.url),
);
const GENERATING_TASKS = ["dev", "test", "check-types"] as const;

type DryRunTask = { taskId: string; dependencies: string[] };

const planTasks = (task: string): DryRunTask[] => {
  const output = execFileSync(
    TURBO_BIN,
    ["run", task, "--dry=json", "--filter=@refresh/db"],
    { cwd: REPO_ROOT, encoding: "utf8" },
  );
  return (JSON.parse(output) as { tasks: DryRunTask[] }).tasks;
};

describe("db task order", () => {
  it.each(GENERATING_TASKS)(
    "runs the db %s task only after the db build has generated the client",
    (task) => {
      // GIVEN
      const tasks = planTasks(task);

      // WHEN
      const dbTask = tasks.find(
        ({ taskId }) => taskId === `@refresh/db#${task}`,
      );

      // THEN
      expect(dbTask?.dependencies).toContain("@refresh/db#build");
    },
  );
});
