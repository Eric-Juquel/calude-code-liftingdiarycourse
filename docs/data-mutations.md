# Data Mutations

## Core Rules

1. **All data mutations MUST go through helper functions** in the `/data` directory that wrap Drizzle ORM calls.
2. **All mutations MUST be triggered from Server Actions** defined in colocated `actions.ts` files.
3. **Server Action parameters MUST be typed** — `FormData` is strictly forbidden as a parameter type.
4. **All Server Actions MUST validate their arguments with Zod** before any business logic or database call.

---

## Data Helpers: `/data` Directory

Mutation helpers follow the same location and structure rules as query helpers (see `/docs/data-fetching.md`). Each helper wraps a single Drizzle ORM operation and is grouped by domain.

```
src/
  data/
    workouts.ts   ← queries + mutations for workouts
    exercises.ts
    sets.ts
```

### Rules

- **No raw SQL** — always use Drizzle ORM.
- **One concern per file** — group by domain, not by operation type.
- **Always scope writes to the current user** — insert/update/delete helpers MUST receive and use `userId` to prevent cross-user data modification.

### Example mutation helper

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

---

## Server Actions: `actions.ts` Files

Server Actions MUST be defined in `actions.ts` files colocated with the feature they serve.

```
src/
  app/
    dashboard/
      page.tsx
      actions.ts   ← Server Actions for the dashboard feature
    workouts/
      [id]/
        page.tsx
        actions.ts
```

### Rules

- Every file MUST start with `"use server"`.
- Parameters MUST use explicit TypeScript types — **`FormData` is forbidden**.
- Arguments MUST be validated with Zod before any other logic.
- `userId` MUST be retrieved from the Clerk session inside the action — never accepted as a parameter.
- On validation failure, return a typed error response rather than throwing.

### Example Server Action

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await createWorkout(userId, parsed.data.name, parsed.data.date);

  redirect("/dashboard");
}
```

---

## Return Type Convention

Server Actions MUST return one of:

| Outcome | Return value |
|---|---|
| Success with redirect | call `redirect()` — no return value needed |
| Success with data | `{ data: T }` |
| Validation error | `{ error: ZodFieldErrors }` |
| Unexpected error | `{ error: string }` — caught in a `try/catch` |

---

## Security Rules

- **Never accept `userId` as a parameter** — always derive it from `auth()` inside the action.
- **Always scope mutations to the current user** — pass `userId` to every data helper that writes to the database.
- **Validate all input with Zod** — treat every incoming argument as untrusted, even when called from a trusted UI component.

---

## Forbidden Patterns

- **`FormData` parameters** — use a typed object validated by Zod instead.
- **Raw SQL in Server Actions** — all database access must go through `/data` helpers.
- **Mutations in Server Components** — mutations belong in Server Actions only.
- **Mutations in Route Handlers** — `app/api/` route handlers must not perform data mutations.
- **Trusting client-supplied `userId`** — always re-derive from the Clerk session.
