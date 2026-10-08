# Code Standards

These rules take precedence over any conflicting guidance elsewhere (including the Ultracite/Biome defaults listed below). Applies to `.ts` / `.tsx` files unless stated otherwise.

## No comments

Don't write comments. Code should be self-explanatory through naming and structure. Only exception: something non-obvious that can't be expressed in code, e.g. a complex regex.

```ts
// Bad
// check if email is valid
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Good — comment justified, regex intent isn't obvious from reading it
// Matches "local@domain.tld", rejects embedded whitespace
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

## File size limit

No `.ts` / `.tsx` file over 100 lines. If a file grows past that, split responsibilities into separate files (extract components, hooks, helpers, types).

## Function/method size limit

Functions and methods must be at most 30 lines. If the behavior needs more, split into smaller, well-named functions.

```ts
// Bad — one 40-line function doing parsing + validation + formatting

// Good
function parseTask(raw: RawTask): Task { /* ... */ }
function validateTask(task: Task): void { /* ... */ }
function formatTask(task: Task): FormattedTask { /* ... */ }
```

## Max 3 levels of nested if/else — prefer guard clauses

Don't nest conditionals more than 3 levels deep. Use early returns (guard clauses) instead of accumulating nested logic.

```ts
// Bad
function getDiscount(user: User) {
  if (user) {
    if (user.isActive) {
      if (user.plan === "premium") {
        return 0.2;
      }
    }
  }
  return 0;
}

// Good
function getDiscount(user: User) {
  if (!user) return 0;
  if (!user.isActive) return 0;
  if (user.plan !== "premium") return 0;
  return 0.2;
}
```

## Max 3 parameters — use param objects

Functions/methods take at most 3 parameters. If more are needed, group them into a param object.

```ts
// Bad
function createTask(title: string, priority: number, dueDate: Date, note: string, projectId: string) {}

// Good
type CreateTaskParams = {
  title: string;
  priority: number;
  dueDate: Date;
  note: string;
  projectId: string;
};

function createTask({ title, priority, dueDate, note, projectId }: CreateTaskParams) {}
```

## No blank lines inside functions/methods

Don't leave blank lines inside a function or method body. Blank lines between top-level functions/methods in a file are fine.

```ts
// Bad
function total(items: Item[]) {
  const sum = items.reduce((acc, i) => acc + i.weight, 0);

  return sum * WEIGHT_FACTOR;
}

// Good
function total(items: Item[]) {
  const sum = items.reduce((acc, i) => acc + i.weight, 0);
  return sum * WEIGHT_FACTOR;
}
```

## Extract magic numbers/strings into constants

Replace magic numbers/strings with named constants that make the concept explicit.

```ts
// Bad
if (age >= 18) { /* ... */ }

// Good
const LEGAL_AGE = 18;
if (age >= LEGAL_AGE) { /* ... */ }
```

## Declare variables close to where they're used

Don't declare a variable far above its first use. Declare it right before the block that needs it.

```ts
// Bad
const formatted = formatDuration(minutes);
const user = getUser();
// ...many lines later
doSomethingWith(formatted);

// Good
const user = getUser();
// ...
const formatted = formatDuration(minutes);
doSomethingWith(formatted);
```

## Never hardcode sensitive data

API keys, secrets, tokens, credentials — never in code. Always read from `.env` via `process.env`, with a matching entry added to `.env.example` (no real value).

```ts
// Bad
const apiKey = "abc123-live-key";

// Good
const apiKey = process.env.SERVICE_API_KEY;
```

---

## Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions

## Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

## Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

## React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

## Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them

## Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

## Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

## Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting
