# Routing

## Route Structure

All application pages MUST live under the `/dashboard` route segment. There are no exceptions.

```
src/app/
├── page.tsx                          # Public home/landing page
├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in (public)
├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up (public)
└── dashboard/
    ├── layout.tsx                    # Dashboard shell layout
    ├── page.tsx                      # /dashboard (main dashboard)
    └── [feature]/
        └── page.tsx                  # /dashboard/[feature]
```

## Route Protection

All `/dashboard` routes are protected and must only be accessible by authenticated users.

### Primary Protection: Middleware

Route protection is enforced at the edge via Next.js middleware using Clerk's `clerkMiddleware`. This is the single source of truth for access control at the routing layer.

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

- Public routes: `/`, `/sign-in`, `/sign-up`
- All other routes (including all `/dashboard/**`) are protected by default

### Secondary Protection: Server Components

Even with middleware in place, every protected Server Component page MUST also call `auth()` and redirect unauthenticated users. Middleware is a safety net, not the only guard.

```tsx
// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // ...
}
```

## Naming Conventions

- Route folders use **kebab-case**: `workout-log/`, `personal-records/`
- Dynamic segments use **camelCase bracket notation**: `[workoutId]`, `[exerciseId]`
- Page files are always named `page.tsx`
- Layout files are always named `layout.tsx`

## Forbidden Patterns

- **No feature routes outside `/dashboard`** — all authenticated app pages must be under `/dashboard`.
- **No client-side route guards** — do not use `useEffect` + `router.push` to redirect unauthenticated users. Use middleware and server-side `auth()` checks.
- **No route handlers for page data** — use React Server Components for data fetching (see `/docs/data-fetching.md`).
- **No hardcoded redirects to external URLs** — only redirect to internal app routes.
