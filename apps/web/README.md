This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## UI system

- Components come from shadcn/ui on Base UI (preset `b2aUNZqRPM`, `components.json`). Add primitives with the shadcn CLI; they land in `src/components/ui/`, which is vendored and exempt from lint size rules and coverage.
- Theming: `next-themes` toggles the `dark` class on `<html>` (System, Light, Dark; stored under `refresh-theme`). Colors are tokens in `src/app/globals.css`; contrast ratios are listed in `tasks/prd-ui-redesign/evidences/contrast-tokens.md`.
- HUD building blocks live in `src/components/hud/`, the theme provider and menu in `src/components/theme/`, theme options in `src/lib/theme/`. Icons are Phosphor.
- E2E (`pnpm test:e2e`) covers axe in light and dark at 320, 768, and 1280 px, no horizontal scroll, reduced motion, and forced colors.
