# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layouts, and API routes under `src/app/api/*`.
- `src/components`: Reusable UI, layout, blog, and section components (PascalCase files).
- `src/lib`: App utilities and API clients (`lib/api/*.ts`, `lib/utils*`).
- `src/types`: Shared TypeScript types and declarations.
- `public`: Static assets (images, icons, fonts).
- Styling lives in `src/app/globals.css` with Tailwind configured in `tailwind.config.js`.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server at `http://localhost:3000`.
- `npm run dev:https`: Dev with HTTPS (uses local certificates).
- `npm run build`: Production build with Next.js.
- `npm start`: Run the production server from `.next` output.
- `npm run lint`: Lint with Next.js/ESLint config.
- `npm run format` / `format:check`: Format or verify formatting with Prettier.

## Coding Style & Naming Conventions
- Prettier: 2‑space indent, single quotes, semicolons, trailing commas (ES5), width 100, `arrowParens: avoid`.
- ESLint extends `next/core-web-vitals` and TypeScript rules; import via `@/*` alias.
- Files: React components `PascalCase.tsx`; hooks `useSomething.ts`; utilities `camelCase.ts`.
- Types: `PascalCase` in `src/types/*`. Keep APIs in `src/lib/api/*` with clear, resource‑based names.

## Testing Guidelines
- No formal test setup yet. If adding tests: co‑locate as `*.test.ts(x)` next to source, use Jest + React Testing Library.
- Prefer component tests for `src/components/*` and light integration for pages under `src/app/*`.
- Add an `npm test` script when introducing the test runner.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`, `test` (messages may be English or Korean).
- PRs: small, focused changes; include description, linked issues, and screenshots/GIFs for UI.
- Before opening: run `npm run lint` and `npm run build`; update docs if behavior changes.

## Security & Configuration Tips
- Env vars: set `NEXT_PUBLIC_API_URL` in `.env.development` and `.env.production`. Do not commit secrets.
- For local HTTPS, use `npm run dev:https` (certs are in `certificates/`).
- Keep server interactions inside `src/lib/api/*`; never expose private tokens in client components.

