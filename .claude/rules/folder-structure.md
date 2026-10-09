# Folder Structure

pnpm + Turborepo monorepo. Workspaces: `apps/*` and `packages/*`. Package names are scoped `@refresh/*`.

## Tree

```
.
├── AGENTS.md                  # agent entrypoint (rules, skills, commands)
├── package.json               # root scripts, all delegate to turbo
├── pnpm-workspace.yaml        # workspaces + shared dependency catalog
├── turbo.json                 # task graph (build, dev, lint, test, ...)
├── .claude/
│   ├── rules/                 # always-read project rules
│   └── skills/                # on-demand skills (e.g. react-rules)
├── apps/
│   ├── web/                   # @refresh/web — Next.js frontend
│   │   ├── src/app/           # App Router: layout.tsx, page.tsx, globals.css
│   │   ├── public/            # static assets
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── biome.json         # extends @refresh/config/biome/next
│   │   └── AGENTS.md          # Next.js-specific agent rules
│   └── scan-worker/           # @refresh/scan-worker — Node + Playwright worker
│       ├── src/index.ts       # entrypoint (empty for now)
│       ├── tsconfig.json
│       └── biome.json         # extends @refresh/config/biome/base
└── packages/
    └── config/                # @refresh/config — shared tooling config only
        ├── biome.base.json    # exported as @refresh/config/biome/base
        └── biome.next.json    # exported as @refresh/config/biome/next
```

## Where things go

| Kind of code | Location |
| --- | --- |
| Pages, layouts, routes | `apps/web/src/app/` |
| Static files served as-is | `apps/web/public/` |
| Worker logic (scanning, browser automation) | `apps/scan-worker/src/` |
| Shared lint/format config | `packages/config/` |
| Code shared by several workspaces | new package under `packages/<name>/` (`@refresh/<name>`) |
| Project rules / skills for agents | `.claude/rules/` / `.claude/skills/` |
| SDD feature artifacts (PRD, TechSpec, tasks, review, QA) | `tasks/prd-[slug]/` |

## Conventions

- Apps never import from each other. Share code through a `packages/*` workspace.
- Reference internal packages as `"@refresh/<name>": "workspace:*"`.
- Shared dev tool versions (`@biomejs/biome`, `ultracite`) come from the `catalog:` in `pnpm-workspace.yaml`.
- Generated or local-only folders are not source: `node_modules/`, `.next/`, `.turbo/`, `dist/`.
