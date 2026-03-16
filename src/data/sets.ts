import { db } from "@/db";
import { sets, exercises, workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createSet(
  userId: string,
  exerciseId: number,
  setNumber: number,
  reps: number,
  weight: number
) {
  const exercise = await db
    .select({ id: exercises.id })
    .from(exercises)
    .innerJoin(workouts, eq(workouts.id, exercises.workoutId))
    .where(and(eq(exercises.id, exerciseId), eq(workouts.userId, userId)))
    .limit(1);

  if (!exercise[0]) return null;

  return db.insert(sets).values({ exerciseId, setNumber, reps, weight: String(weight) });
}

export async function deleteSet(userId: string, setId: number) {
  const set = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(exercises, eq(exercises.id, sets.exerciseId))
    .innerJoin(workouts, eq(workouts.id, exercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))
    .limit(1);

  if (!set[0]) return null;

  return db.delete(sets).where(eq(sets.id, setId));
}

export async function countSetsInExercise(exerciseId: number): Promise<number> {
  const result = await db
    .select({ id: sets.id })
    .from(sets)
    .where(eq(sets.exerciseId, exerciseId));

  return result.length;
}
