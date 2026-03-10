# Data Fetching

## Core Rule: Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

The following approaches are strictly forbidden:
- Route handlers (`app/api/`) for fetching data
- Client components (`"use client"`) fetching data (via `useEffect`, SWR, React Query, `fetch`, etc.)
- Any other client-side data fetching mechanism

Server Components provide direct, secure, performant access to the database without exposing data fetching logic to the client.

## Database Queries: `/data` Directory

All database queries MUST be encapsulated in helper functions located in the `/data` directory.

### Rules

1. **No raw SQL** — always use Drizzle ORM queries.
2. **One concern per file** — group helpers by domain (e.g., `data/workouts.ts`, `data/exercises.ts`).
3. **Always scope to the current user** — every query that returns user data MUST filter by the authenticated user's ID. A logged-in user must NEVER be able to access another user's data.

### Example structure

```
src/
  data/
    workouts.ts
    exercises.ts
    sets.ts
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Always require userId — never expose data without it
export async function getWorkoutsByUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example Server Component consuming the helper

```tsx
// src/app/dashboard/page.tsx
import { getWorkoutsByUser } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsByUser(session.user.id);

  return (
    <ul>
      {workouts.map((w) => (
        <li key={w.id}>{w.name}</li>
      ))}
    </ul>
  );
}
```

## Security: User Data Isolation

This is non-negotiable. Every data helper that returns user-specific data MUST:

- Accept a `userId` parameter.
- Filter the query with `eq(table.userId, userId)`.
- Never return data belonging to a different user.

Passing the `userId` from the authenticated session in the Server Component (not from URL params or user input) is the only acceptable pattern.
