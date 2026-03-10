# Authentication

## Provider: Clerk

This app uses **Clerk** as the sole authentication provider. No other auth libraries or custom session handling are permitted.

## Getting the Current User

Always retrieve the authenticated user via Clerk's `auth()` helper from `@clerk/nextjs/server`. This is the only accepted pattern — never read user identity from URL params, query strings, request bodies, or any client-supplied value.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

If `userId` is `null`, the user is not authenticated. Guard all protected logic accordingly.

## Protecting Pages and Data

### Server Components (pages)

Use `auth()` at the top of every protected Server Component to get the `userId`. If the user is unauthenticated, redirect to the sign-in page.

```tsx
// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsByUser } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const workouts = await getWorkoutsByUser(userId);

  return (
    <ul>
      {workouts.map((w) => (
        <li key={w.id}>{w.name}</li>
      ))}
    </ul>
  );
}
```

### Middleware

Use Clerk's `clerkMiddleware` in `src/proxy.ts` to protect routes at the edge.

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

## Data Isolation Rule

Every data helper in `/data` that returns user-specific records MUST receive `userId` from the authenticated Clerk session — never from user input.

```ts
// CORRECT — userId comes from Clerk session in the Server Component
const { userId } = await auth();
const workouts = await getWorkoutsByUser(userId);

// FORBIDDEN — userId comes from an untrusted source
const workouts = await getWorkoutsByUser(params.userId);
```

See `/docs/data-fetching.md` for full data helper rules.

## UI Components

Use Clerk's pre-built components for auth UI. Do not build custom sign-in/sign-up forms.

```tsx
import { SignIn, SignUp, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
```

- `<SignIn />` — renders the Clerk-hosted sign-in form
- `<SignUp />` — renders the Clerk-hosted sign-up form
- `<UserButton />` — renders the avatar/menu for the signed-in user
- `<SignedIn>` / `<SignedOut>` — conditional rendering wrappers

## Forbidden Patterns

- **No custom session management** — do not use cookies, JWTs, or any other mechanism to track auth state.
- **No other auth libraries** — NextAuth, Auth.js, Lucia, and similar are not permitted.
- **No client-side `userId` sourcing** — never read `userId` from `useUser()` and pass it to a server action or data call as a trusted value. Always re-validate on the server with `auth()`.
- **No route handlers for auth** — Clerk handles all auth callbacks internally.
