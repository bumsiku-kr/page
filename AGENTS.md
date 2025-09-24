# Repository Guidelines

## Project Structure & Module Organization
- Follow the official App Router layout; keep `layout.tsx`, `page.tsx`, and route segments inside `src/app` per the Next.js project-structure guide.
- Use only documented route groups (`src/app/(group)`) and `src/app/api` handlers—no ad-hoc directory schemes.
- UI primitives stay in `src/components`; feature modules live in `src/features/<feature>` with colocated hooks, and shared utilities belong in `src/context`, `src/lib`, and `src/types`.

## React Principles
- Compose small, declarative components and prefer composition over inheritance.
- Colocate state with its owner, pass data downward via props, and surface changes with callbacks.
- Use hooks for effects and async work; preserve React's one-way data flow.

## Refactoring Practices
- Ship refactors in incremental, stable slices backed by lint or manual checks.
- Realign folders and imports to the sanctioned App Router structure as soon as drift appears.
- Stage broader rewrites behind feature flags to contain risk.

## Build, Test, and Development Commands
- `npm run dev`: Start the dev server (HTTP) or `npm run dev:https` for TLS.
- `npm run build`: Build the production bundle before releases.
- `npm run start`: Serve compiled output for smoke tests.
- `npm run lint`: Run ESLint with the Next.js + TypeScript setup.
- `npm run format` / `npm run format:check`: Apply or verify Prettier across `src`.

## Coding Style & Naming Conventions
- Baseline frameworks are Next.js `15.4.x` and TypeScript `5.x`; keep changes compatible and avoid downgrades without approval.
- Favor explicit interfaces from `src/types` and Zod schemas for runtime validation.
- Prettier enforces 2-space indent, single quotes, semicolons, trailing commas, 100-column wraps.
- Name components in `PascalCase`, hooks in `useCamelCase`, utilities in `camelCase`, files in kebab-case.
- Prefer Tailwind utilities; reach for module styles under `src/styles` only when necessary.

## Testing Guidelines
- Automated tests are not yet wired; rely on `npm run lint`, manual checks via `npm run start`, and document QA in PRs.
- When adding tests, colocate `*.test.ts(x)` files or add suites under `src/features/<feature>/tests`.

## Commit & Pull Request Guidelines
- Use conventional commit prefixes (`feat`, `fix`, `docs`, `chore`) as in `feat: 게시글 작성 및 수정 기능 개선`.
- Keep commits focused, ensure lint/build pass before pushing, and include summary, linked issue, UI evidence, and env/migration notes in PRs before requesting review.

## Environment Notes
- Keep secrets in `.env.development` and `.env.production`, rotate HTTPS certs when they expire, and never commit credentials.
