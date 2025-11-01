# Repository Guidelines

This Next.js 16 + React 19 project powers the Omikuji experience; follow these practices to keep contributions consistent and shippable.

## Project Structure & Module Organization
- `app/`: App Router entrypoints. `layout.tsx` defines the shared shell, `page.tsx` hosts the home experience, and `globals.css` loads Tailwind utilities plus project tokens.
- `public/`: Static assets served verbatim; keep SVGs and media fingerprinted and referenced via `/asset-name`.
- Root configs (`tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`) govern build, TypeScript, lint, and styling. Use the `@/*` alias for root-relative imports to avoid brittle paths.

## Build, Test, and Development Commands
- `npm install`: Install dependencies once before local work.
- `npm run dev`: Start the Next dev server with HMR at `http://localhost:3000`.
- `npm run build`: Produce an optimized production build; run before shipping.
- `npm run start`: Serve the production build locally for smoke tests.
- `npm run lint`: Run ESLint with the Next.js core-web-vitals rules; fix issues before committing.

## Coding Style & Naming Conventions
- Write TypeScript with `strict` assumptions; add explicit return types on exported functions.
- Use 2-space indentation, PascalCase for React components, camelCase for utilities, and SCREAMING_CASE for constants.
- Tailwind classes live inline; group related utilities (layout → spacing → color) to keep diffs tidy.
- Keep imports sorted by package → absolute (`@/…`) → relative modules.

## Testing Guidelines
- A formal test harness is not yet configured. When adding one, favor Next.js-supported tooling (Playwright or Vitest) and document new commands here.
- Until automated tests exist, defend changes with `npm run lint`, targeted manual QA steps in PRs, and lightweight storybook-style demos when relevant.

## Commit & Pull Request Guidelines
- Commits should use imperative subjects (`Add Omikuji result grid`), limit the first line to 72 characters, and include a short body when extra context helps reviewers.
- Each PR needs: overview of the change, GIF or screenshot for UI updates, list of verification steps (commands/manual checks), and linked issue or task IDs when available.
- Keep PRs scoped; open follow-ups for unrelated cleanup instead of bundling.

## Configuration Notes
- Create `.env.local` for secrets; never check credentials into Git. Mirror any env additions in PR descriptions and the README.
