import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, exercises } from "@/db/schema";
import { eq, and, gte, lt, count } from "drizzle-orm";

export async function createWorkout(
  userId: string,
  name: string | null,
  startedAt: Date
) {
  return db.insert(workouts).values({ userId, name, startedAt });
}

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();
  if (!userId) return null;

  const result = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
    })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

export async function updateWorkout(
  userId: string,
  workoutId: number,
  name: string | null,
  startedAt: Date
) {
  return db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function getWorkoutsByUserAndDate(date: Date) {
  const { userId } = await auth();
  if (!userId) return [];

  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);

  return db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseCount: count(exercises.id),
    })
    .from(workouts)
    .leftJoin(exercises, eq(exercises.workoutId, workouts.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    )
    .groupBy(workouts.id);
}
