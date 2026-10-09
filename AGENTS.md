<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Project overview

`refresh` — pnpm + Turborepo monorepo (`pnpm@11.9.0`, Node `>=22`). Packages scoped `@refresh/*`.

## Folder structure

See `.claude/rules/folder-structure.md` for the full tree and where each kind of code lives.

## Apps

### `apps/web` (`@refresh/web`)
- **Role:** user-facing web app.
- **Tech:** Next.js 16.4 (App Router, Turbopack), React 19.3, Tailwind CSS 4 (via `@tailwindcss/turbopack` loader configured in `next.config.ts`), TypeScript 5.
- **Runs on:** `http://localhost:3000` (Next default; no custom port set). `pnpm --filter @refresh/web dev`.
- **Warning:** this Next.js version has breaking changes vs. training data. Read `node_modules/next/dist/docs/` before writing code.

### `apps/scan-worker` (`@refresh/scan-worker`)
- **Role:** background worker that scans pages using a headless browser. `src/index.ts` is still empty — no logic yet.
- **Tech:** Node ESM (`"type": "module"`), TypeScript 5, `tsx` runner, Playwright 1.x. Compiled with `tsc`.
- **Runs on:** no HTTP port; it is a plain Node process (no server code yet).
- **Playwright:** browsers may need install: `pnpm --filter @refresh/scan-worker exec playwright install chromium`.

## Packages

### `packages/config` (`@refresh/config`)
Shared Biome/Ultracite lint+format config, no runtime code. Exports `@refresh/config/biome/base` and `@refresh/config/biome/next`. Apps' `biome.json` extend these. Use `base` for Node/TS apps, `next` for the Next.js app.

## Commands

Run from repo root unless noted. Package manager is **pnpm** (never npm/yarn).

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Dev (all apps, TUI) | `pnpm dev` |
| Dev single app | `pnpm --filter @refresh/web dev` / `pnpm --filter @refresh/scan-worker dev` |
| Build all | `pnpm build` (`turbo run build`; outputs `.next/**`, `dist/**`) |
| Build single | `pnpm --filter @refresh/web build` |
| Start prod build | `pnpm --filter @refresh/web start` / `pnpm --filter @refresh/scan-worker start` |
| Lint (Biome) | `pnpm lint` |
| Format | `pnpm format` |
| Type check | `pnpm check-types` |
| Ultracite check/fix (per app) | `pnpm --filter <app> check` / `fix` |
| Tests | `pnpm test` (`turbo run test`) |

Notes:
- **No test runner or `test` script exists yet** in any workspace, so `pnpm test` currently runs nothing. When adding tests, add a `test` script to the workspace `package.json`; turbo caches `coverage/**` and runs after `^build`.
- Shared dev tool versions (`@biomejs/biome`, `ultracite`) are pinned in the `catalog:` of `pnpm-workspace.yaml`; reference them as `"catalog:"`.
- `allowBuilds` in `pnpm-workspace.yaml` restricts which deps may run install scripts (only `esbuild` allowed).
- Lint/format tool is Biome via Ultracite, not ESLint/Prettier. Note `apps/web` uses tabs; `scan-worker` and root use 2 spaces in package.json — let `pnpm format` decide.

# Rules

Project rules live in `.claude/rules/`. Read the relevant file before writing or changing code. They take precedence over conflicting guidance elsewhere (including Ultracite/Biome defaults).

| File | Applies to |
| --- | --- |
| `.claude/rules/folder-structure.md` | repo layout, workspace roles, where new code goes |
| `.claude/rules/code-standards.md` | all `.ts` / `.tsx` code (e.g. no comments, naming, structure) |
| `.claude/rules/tests.md` | every automated test; all code must be covered by tests |

# Skills

Project skills live in `.claude/skills/`. They load on demand, only when the task matches.

| Skill | Load when |
| --- | --- |
| `react-rules` (`.claude/skills/react-rules/SKILL.md`) | writing, editing, or reviewing any `.tsx` file, React component, hook, or Tailwind styling (Next.js App Router + React 19 + Tailwind v4). Invoke it before touching React code. |

## Spec-driven development (SDD) flow

Features follow PRD → TechSpec → tasks → implementation → review → QA. All artifacts live in `tasks/prd-[slug]/` (`prd.md`, `techspec.md`, `tasks.md`, `task_[num].md`, `codereview.md`, `qa.md`, `evidences/`).

| Skill | Load when |
| --- | --- |
| `create-prd` (`.claude/skills/create-prd/SKILL.md`) | defining requirements and scope of a new feature. Outputs `prd.md`. |
| `create-techspec` (`.claude/skills/create-techspec/SKILL.md`) | designing the architecture of a feature that already has a PRD. Outputs `techspec.md`. |
| `create-tasks` (`.claude/skills/create-tasks/SKILL.md`) | breaking a feature with PRD + TechSpec into implementation tasks. Outputs `tasks.md` + `task_[num].md`. |
| `execute-task` (`.claude/skills/execute-task/SKILL.md`) | implementing the next incomplete task of a feature. |
| `execute-review` (`.claude/skills/execute-review/SKILL.md`) | reviewing a feature's code against rules, TechSpec, and tasks. Outputs `codereview.md`. |
| `execute-qa` (`.claude/skills/execute-qa/SKILL.md`) | validating an implemented feature against the PRD acceptance criteria. Outputs `qa.md`. |
