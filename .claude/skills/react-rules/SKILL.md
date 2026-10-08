---
name: react-rules
description: Project React rules (function components, small components, no prop spreading, useEffect/useMemo usage, data-access split, use-prefixed hooks, accessibility, Tailwind v4). Use when writing, editing, or reviewing any .tsx file, React component, hook, or Tailwind styling in apps/web.
---

# React Rules

These rules take precedence over any conflicting guidance elsewhere. They apply to every `.tsx` file in this repo (Next.js 16 App Router + React 19 + Tailwind CSS v4).

## Prefer functional components

No class components. Function components only, typed props, no `React.FC`.

```tsx
// Bad
class TaskRow extends React.Component<TaskRowProps> {
  render() {
    return <tr>{this.props.task.title}</tr>;
  }
}

// Good
type TaskRowProps = {
  task: Task;
};

function TaskRow({ task }: TaskRowProps) {
  return <tr>{task.title}</tr>;
}
```

React 19: pass `ref` as a normal prop, never `React.forwardRef`.

## Create small and reusable components

One component, one responsibility. If a component renders several unrelated visual blocks, split it. Combined with the 100-line file limit, this means most components live in their own file.

```tsx
// Bad — one component doing header + filters + list + empty state
function TasksPage({ tasks }: TasksPageProps) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Tasks</h1>
        <button className="rounded-md bg-primary px-3 py-2" type="button">New</button>
      </div>
      <div className="flex gap-2">{/* ...filters... */}</div>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks yet</p>
      ) : (
        <ul>{/* ...rows... */}</ul>
      )}
    </section>
  );
}

// Good — composable pieces, each reusable and testable on its own
function TasksPage({ tasks }: TasksPageProps) {
  return (
    <section className="flex flex-col gap-4">
      <TasksHeader />
      <TaskFilters />
      <TaskList tasks={tasks} />
    </section>
  );
}
```

Reusable means: no knowledge of where it is rendered, no reaching into global state it does not own, props as the only input.

## Avoid spreading props

Never write `<Element {...props} />`. Spreading hides the component's real contract, leaks unintended attributes into the DOM, and makes renames invisible to TypeScript. List props explicitly.

```tsx
// Bad — what does Card actually accept? Nobody knows
function TaskCard(props: TaskCardProps) {
  return <Card {...props} />;
}

// Good — explicit contract
type TaskCardProps = {
  title: string;
  priority: number;
  onSelect: () => void;
};

function TaskCard({ title, priority, onSelect }: TaskCardProps) {
  return (
    <Card onClick={onSelect} title={title}>
      <PriorityBadge value={priority} />
    </Card>
  );
}
```

Exception: shadcn/ui primitives under `src/components/ui/` are generated wrappers around native elements and may keep their `...props` passthrough. Don't introduce the pattern in application code.

## Avoid unnecessary `useEffect`

`useEffect` is for synchronizing with something outside React (subscriptions, browser APIs, non-React widgets). It is not for deriving data, transforming props, or fetching in a Server Component tree.

```tsx
// Bad — derived state in an effect: extra render, stale window
function TaskTotal({ tasks }: TaskTotalProps) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(tasks.reduce((sum, task) => sum + task.estimateMinutes, 0));
  }, [tasks]);
  return <DurationLabel value={total} />;
}

// Good — compute during render
function TaskTotal({ tasks }: TaskTotalProps) {
  const total = tasks.reduce((sum, task) => sum + task.estimateMinutes, 0);
  return <DurationLabel value={total} />;
}
```

```tsx
// Bad — fetching in a Client Component effect
function ProjectProgress({ projectId }: ProjectProgressProps) {
  const [progress, setProgress] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((response) => response.json())
      .then((data) => setProgress(data.progress));
  }, [projectId]);
  return <ProgressLabel value={progress ?? 0} />;
}

// Good — async Server Component, data fetched on the server
async function ProjectProgress({ projectId }: ProjectProgressProps) {
  const project = await getProjectProgress(projectId);
  return <ProgressLabel value={project.progress} />;
}
```

An effect is justified for: event listeners, `IntersectionObserver`, `localStorage` sync, timers, and third-party imperative libraries. Always return a cleanup function.

## Use `useMemo` for heavy calculations only

`useMemo` exists to skip expensive work across re-renders. Memoizing a string concat or a cheap comparison costs more than it saves.

```tsx
// Bad — memoizing trivial work
const label = useMemo(() => `${project.name} (${project.owner})`, [project]);

// Good — expensive aggregation over a large list
function WeeklyReport({ tasks }: WeeklyReportProps) {
  const weeklyTotals = useMemo(
    () => aggregateByWeek(tasks),
    [tasks]
  );
  return <BarChart data={weeklyTotals} />;
}
```

Also valid: stabilizing a reference passed to a memoized child or used in a dependency array.

```tsx
// Good — stable reference keeps the memoized chart from re-rendering
const chartOptions = useMemo(() => ({ unit, locale }), [unit, locale]);
return <MemoizedChart options={chartOptions} />;
```

## Split data-access responsibilities out of components

Components render. They do not build SQL, call `db` inline, or hold fetch URLs. Data access lives in server-side modules; the component consumes the returned data.

```tsx
// Bad — query logic embedded in the component
async function TaskList({ projectId }: TaskListProps) {
  const tasks = await db.task.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { dueDate: "desc" },
    take: 50,
  });
  return <ul>{tasks.map((task) => <TaskRow key={task.id} task={task} />)}</ul>;
}
```

```ts
// Good — src/server/tasks/list-tasks.ts
const RECENT_TASKS_LIMIT = 50;

export async function listRecentTasks(projectId: string): Promise<Task[]> {
  return db.task.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { dueDate: "desc" },
    take: RECENT_TASKS_LIMIT,
  });
}
```

```tsx
// Good — src/components/tasks/task-list.tsx
async function TaskList({ projectId }: TaskListProps) {
  const tasks = await listRecentTasks(projectId);
  return (
    <ul>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}
```

The payoff: the query is unit-testable without rendering, and the component is testable without a database.

## Extract logic into `use`-prefixed hooks

Stateful logic that is not JSX belongs in a custom hook named `use*`, in its own file. The component keeps markup and wiring only.

```tsx
// Bad — form state, validation and submission tangled with markup
function TaskForm() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...30 more lines of handlers and validation...
  return <form>{/* ... */}</form>;
}
```

```ts
// Good — src/hooks/use-task-form.ts
export function useTaskForm() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async () => {
    setIsSubmitting(true);
    try {
      await createTask({ title });
      setError(null);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return { title, setTitle, error, isSubmitting, submit };
}
```

```tsx
// Good — src/components/tasks/task-form.tsx
function TaskForm() {
  const { title, setTitle, error, isSubmitting, submit } = useTaskForm();
  return (
    <form onSubmit={submit}>
      <label className="text-sm" htmlFor="title">Title</label>
      <input
        aria-describedby={error ? "title-error" : undefined}
        aria-invalid={Boolean(error)}
        id="title"
        onChange={(event) => setTitle(event.target.value)}
        value={title}
      />
      {error ? <p className="text-destructive text-sm" id="title-error" role="alert">{error}</p> : null}
      <button disabled={isSubmitting} type="submit">Save</button>
    </form>
  );
}
```

Hooks are called at the top level only, never conditionally or inside loops.

## Always use accessibility attributes

Semantic elements first (`<button>`, `<nav>`, `<main>`, `<label>`); ARIA fills the gaps semantics cannot express. Every interactive element must be reachable and announceable.

```tsx
// Bad — no name, no semantics, no keyboard support
<div className="cursor-pointer" onClick={remove}>
  <TrashIcon />
</div>

// Good
<button
  aria-label="Delete task"
  className="rounded-md p-2 hover:bg-muted"
  onClick={remove}
  type="button"
>
  <TrashIcon aria-hidden="true" />
</button>
```

Checklist for every component:

- Icon-only controls get `aria-label`; decorative icons get `aria-hidden="true"`.
- Inputs get a `<label htmlFor>`; errors get `aria-invalid` + `aria-describedby` + `role="alert"`.
- Toggles get `aria-pressed` / `aria-expanded` and `aria-controls`.
- Async regions get `aria-busy` or `aria-live="polite"`.
- Images get meaningful `alt` (empty `alt=""` when decorative).
- Heading levels descend without skipping.
- Mouse handlers on non-native elements need keyboard equivalents — or use a `<button>`.

```tsx
// Good — live region announces the loaded progress
<output aria-busy={isLoading} aria-live="polite" className="font-medium tabular-nums">
  {isLoading ? "Loading progress" : formatPercent(progress)}
</output>
```

## Style with Tailwind CSS

Tailwind v4 utility classes are the styling mechanism. No CSS Modules, no styled-components, no inline `style` objects for static styling.

```tsx
// Bad
<div style={{ display: "flex", gap: 8, padding: 16 }}>

// Good
<div className="flex gap-2 p-4">
```

- Compose conditional classes with the `cn` helper from `@/lib/utils`, never string concatenation.
- Use design tokens from `globals.css` (`bg-background`, `text-muted-foreground`, `border-border`) instead of raw hex or arbitrary values.
- `style` is acceptable only for genuinely dynamic values (a computed bar width, a CSS variable).

```tsx
// Good — conditional classes via cn, tokens over raw colors
<span
  className={cn(
    "rounded-full px-2 py-0.5 text-xs",
    isDone ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
  )}
>
  {label}
</span>
```

```tsx
// Good — dynamic value, not static styling
<div className="h-2 rounded bg-primary" style={{ width: `${percentage}%` }} />
```
