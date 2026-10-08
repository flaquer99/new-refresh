# Testing Rules

These rules take precedence over any conflicting guidance elsewhere. They apply to every automated test in this repo.

## Critical rule: all code must be covered by automated tests

<critical>This rule is critical and must never be ignored.</critical>

- **Minimum coverage: 80%.**
- Coverage is a floor, not a target. 80% with weak assertions is worse than 80% with real ones — see [Self-validated](#self-validated).
- Prioritize what is **critical**, not what is big. Critical means "the business breaks if this is wrong". A scan pipeline is more critical than a settings page — test the pipeline exhaustively before spending effort on settings edge cases.

## Libraries

| Layer | Tool |
| --- | --- |
| Unit + integration | **Vitest** |
| E2E | **Playwright** |

## Test pyramid

```
        /\
       /e2e\        few    — critical user journeys only (Playwright)
      /------\
     / integ. \     some   — module boundaries, DB, API routes (Vitest)
    /----------\
   /    unit    \   many   — pure functions, hooks, components (Vitest)
  /--------------\
```

- **Unit** (largest layer): pure functions, business logic, hooks, single components. Fast, isolated, no I/O.
- **Integration**: real interaction across boundaries — a server action against a test database, a component tree with real children.
- **E2E** (smallest layer): full journeys through the running app. Reserve for critical flows (create a task, run a scan).

Never invert the pyramid. An E2E-heavy suite is slow, flaky, and gives poor failure localization.

## FIRST principles

TIMELY is explicitly out of scope for this project — skip it. The other four are mandatory.

### Fast

Slow tests get skipped, then ignored, then deleted.

- Stub slow external dependencies: network, file system, real databases in unit tests, timers.
- Never sleep on real time — use fake timers.

```ts
// Bad — hits a real network endpoint inside a unit test
it("fetches the latest release", async () => {
  const release = await fetchLatestRelease("acme/widget");
  expect(release.version).not.toBe("");
});

// Good — stub the slow dependency
it("fetches the latest release", async () => {
  vi.spyOn(releaseApi, "get").mockResolvedValue({ version: "1.2.0" });
  const release = await fetchLatestRelease("acme/widget");
  expect(release.version).toBe("1.2.0");
});
```

```ts
// Good — fake timers instead of real waiting
it("retries after the backoff window", async () => {
  vi.useFakeTimers();
  const promise = retryWithBackoff(failingCall);
  await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
  await expect(promise).resolves.toBe("ok");
});
```

### Independent

No test may depend on another test, or on execution order. If test B relies on state left behind by test A, a failure in A cascades into a false failure in B and hides the real cause.

```ts
// Bad — the second test depends on state mutated by the first
let quota: Quota;

it("creates a quota", () => {
  quota = createQuota({ limit: 100 });
  expect(quota.remaining).toBe(100);
});

it("consumes from the quota", () => {
  consume(quota, 30);
  expect(quota.remaining).toBe(70);
});

// Good — each test arranges its own state
it("creates a quota", () => {
  const quota = createQuota({ limit: 100 });
  expect(quota.remaining).toBe(100);
});

it("consumes from the quota", () => {
  const quota = createQuota({ limit: 100 });
  consume(quota, 30);
  expect(quota.remaining).toBe(70);
});
```

Put shared setup in `beforeEach` (fresh instance per test), never in module scope.

### Repeatable

The same test must produce the same result on every run, in every environment, at any time of day.

Mock every non-deterministic source: `Date.now()` / `new Date()`, `Math.random()`, UUID generation, external API responses, environment-dependent values.

```ts
// Bad — the result depends on the moment the test runs
it("marks a task as overdue", () => {
  const task = createTask({ dueDate: new Date() });
  expect(isOverdue(task)).toBe(false);
});

// Good — freeze time
it("marks a task as overdue", () => {
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  const task = createTask({ dueDate: new Date("2025-12-01T00:00:00Z") });
  expect(isOverdue(task)).toBe(true);
});
```

```ts
// Good — deterministic randomness
it("generates a task reference", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  expect(generateReference()).toBe("TASK-500000");
});
```

### Self-validated

A test must fail when the behavior breaks. Executing code without asserting its result gives coverage and catches nothing.

```ts
// Bad — runs the code, validates nothing meaningful
it("calculates the total", () => {
  const total = calculateTotal([{ weight: 10 }, { weight: 20 }]);
  expect(total).toBeDefined();
});

// Good — asserts the actual expected value
it("calculates the total", () => {
  const total = calculateTotal([{ weight: 10 }, { weight: 20 }]);
  expect(total).toBe(30);
});
```

Banned as a test's only assertion: `toBeDefined()`, `toBeTruthy()`, `not.toThrow()`, snapshot-only tests. Assert returned values, thrown error messages, and observable side effects.

```ts
// Good — asserts the error, not just that something threw
it("rejects consuming more than the remaining quota", () => {
  const quota = createQuota({ limit: 50 });
  expect(() => consume(quota, 80)).toThrowError("Quota exceeded");
});
```

## Structure: GIVEN/WHEN/THEN (AAA)

Structure every test body as Arrange / Act / Assert. Keep the three parts visually separated — blank lines inside test bodies are allowed here even though the code-standards "no blank lines in function bodies" rule applies to source code.

```ts
it("applies a 20% discount for active premium users", () => {
  // Arrange (GIVEN)
  const user = createUser({ isActive: true, plan: "premium" });

  // Act (WHEN)
  const discount = getDiscount(user);

  // Assert (THEN)
  expect(discount).toBe(0.2);
});
```

E2E tests follow the same shape:

```ts
test("a user creates a task", async ({ page }) => {
  // GIVEN
  await page.goto("/tasks");

  // WHEN
  await page.getByRole("button", { name: "New task" }).click();
  await page.getByLabel("Title").fill("Write report");
  await page.getByRole("button", { name: "Save" }).click();

  // THEN
  await expect(page.getByRole("row", { name: /Write report/ })).toBeVisible();
});
```

## One concept per test

Each `it` / `test` validates a single behavior or requirement. Never mix unrelated assertions into one block.

```ts
// Bad — two unrelated behaviors in one test
it("handles discounts", () => {
  expect(getDiscount(premiumUser)).toBe(0.2);
  expect(getDiscount(inactiveUser)).toBe(0);
});

// Good — one concept per test
it("gives active premium users a 20% discount", () => {
  expect(getDiscount(premiumUser)).toBe(0.2);
});

it("gives inactive users no discount", () => {
  expect(getDiscount(inactiveUser)).toBe(0);
});
```

The test name states the requirement. If the name needs an "and", split the test.

## Writing order (LLM efficiency)

When writing a batch of tests for a unit of code, write them in this order. Each step narrows the search space and catches the highest-value bugs first.

1. **Happy path** — the primary successful behavior.
2. **Critical business rules** — the domain invariants this code exists to enforce (e.g. "a quota can never go below zero").
3. **Edge cases** — boundaries: empty array, zero, negative, min/max, off-by-one.
4. **Error / failure paths** — invalid input, thrown errors, rejected promises.
5. **Regression tests** — added only when a real bug is found, to lock in the fix.

Example, in order, for `consume`:

```ts
it("subtracts the amount from the remaining quota", () => { /* 1. happy path */ });
it("rejects consumption that would make the remaining quota negative", () => { /* 2. business rule */ });
it("allows consumption that brings the remaining quota to exactly zero", () => { /* 3. edge case */ });
it("throws when the amount is not a positive number", () => { /* 4. error path */ });
it("keeps precision on repeated fractional consumption", () => { /* 5. regression */ });
```

This order is a default, not dogma — apply judgment when a unit's risk profile suggests otherwise.
