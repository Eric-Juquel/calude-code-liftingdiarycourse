import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { exercises, sets, workouts } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export type SetRow = {
  id: number;
  setNumber: number;
  reps: number;
  weight: string;
};

export type ExerciseWithSets = {
  id: number;
  name: string;
  order: number;
  sets: SetRow[];
};

export async function getExercisesWithSetsByWorkoutId(
  workoutId: number
): Promise<ExerciseWithSets[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const rows = await db
    .select({
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseOrder: exercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(exercises)
    .innerJoin(workouts, eq(workouts.id, exercises.workoutId))
    .leftJoin(sets, eq(sets.exerciseId, exercises.id))
    .where(and(eq(exercises.workoutId, workoutId), eq(workouts.userId, userId)))
    .orderBy(asc(exercises.order), asc(sets.setNumber));

  const map = new Map<number, ExerciseWithSets>();

  for (const row of rows) {
    if (!map.has(row.exerciseId)) {
      map.set(row.exerciseId, {
        id: row.exerciseId,
        name: row.exerciseName,
        order: row.exerciseOrder,
        sets: [],
      });
    }
    if (row.setId !== null && row.setNumber !== null && row.reps !== null && row.weight !== null) {
      map.get(row.exerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return Array.from(map.values());
}

export async function createExercise(
  userId: string,
  workoutId: number,
  name: string,
  order: number
) {
  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout[0]) return null;

  return db.insert(exercises).values({ workoutId, name, order });
}

export async function deleteExercise(userId: string, exerciseId: number) {
  const exercise = await db
    .select({ id: exercises.id })
    .from(exercises)
    .innerJoin(workouts, eq(workouts.id, exercises.workoutId))
    .where(and(eq(exercises.id, exerciseId), eq(workouts.userId, userId)))
    .limit(1);

  if (!exercise[0]) return null;

  return db.delete(exercises).where(eq(exercises.id, exerciseId));
}

export async function countExercisesInWorkout(
  userId: string,
  workoutId: number
): Promise<number> {
  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout[0]) return 0;

  const result = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(eq(exercises.workoutId, workoutId));

  return result.length;
}
