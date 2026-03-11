# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 app using the App Router (`src/app/`), React 19, TypeScript, and Tailwind CSS v4.

- `src/app/layout.tsx` — root layout with global fonts/styles
- `src/app/page.tsx` — home page (entry point for the app)
- `public/` — static assets

The project is a fresh scaffold (liftingdiarycourse) intended to be built out as a lifting/workout diary application.

## Documentation Reference

IMPORTANT: Before generating any code, always first check the `/docs` directory for relevant documentation files. All code generated must align with the patterns, conventions, and specifications defined in those docs.

- /docs/ui.md — UI component guidelines and patterns
- /docs/data-fetching.md — Data fetching rules and patterns
- /docs/data-mutations.md — Data mutation rules and Server Action patterns
- /docs/auth.md — Authentication standards (Clerk)
- /docs/routing.md — Routing structure, protection, and naming conventions

## Data Fetching

CRITICAL: ALL data fetching MUST be done exclusively via React Server Components. Route handlers, client components, and any other client-side fetching mechanisms are strictly forbidden.

- All database queries MUST live in helper functions inside the `/data` directory.
- Helper functions MUST use Drizzle ORM. Raw SQL is forbidden.
- Every query returning user data MUST filter by the authenticated user's ID. Users must never access other users' data.

## Code generated must follow the conventions outlined in the documentation, including:

- Be Eslint compliant
- Be SonarQube compliant (no code smells, bugs, or vulnerabilities)
- Use props as read-only data passed from parent to child components
- Use TypeScript with proper typing
- Follow the established file structure and naming conventions
- Adhere to the design system and component patterns defined in the UI documentation
