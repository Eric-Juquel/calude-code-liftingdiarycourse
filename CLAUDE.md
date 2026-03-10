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
