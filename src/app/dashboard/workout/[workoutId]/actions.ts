"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";
import {
  createExercise,
  deleteExercise,
  countExercisesInWorkout,
} from "@/data/exercises";
import { createSet, deleteSet, countSetsInExercise } from "@/data/sets";

// ── Update workout ──────────────────────────────────────────────────────────

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().max(100).optional(),
  startedAt: z.coerce.date(),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export type UpdateWorkoutResult = {
  error: Partial<Record<keyof UpdateWorkoutInput, string[]>>;
};

export async function updateWorkoutAction(
  input: UpdateWorkoutInput
): Promise<UpdateWorkoutResult | void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = updateWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: z.flattenError(parsed.error).fieldErrors };
  }

  await updateWorkout(
    userId,
    parsed.data.workoutId,
    parsed.data.name ?? null,
    parsed.data.startedAt
  );

  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

// ── Add exercise ────────────────────────────────────────────────────────────

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1).max(100),
});

export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

export type AddExerciseResult = {
  error: Partial<Record<keyof AddExerciseInput, string[]>>;
};

export async function addExerciseAction(
  input: AddExerciseInput
): Promise<AddExerciseResult | void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = addExerciseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: z.flattenError(parsed.error).fieldErrors };
  }

  const order = (await countExercisesInWorkout(userId, parsed.data.workoutId)) + 1;
  await createExercise(userId, parsed.data.workoutId, parsed.data.name, order);

  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

// ── Delete exercise ─────────────────────────────────────────────────────────

const deleteExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;

export async function deleteExerciseAction(
  input: DeleteExerciseInput
): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = deleteExerciseSchema.safeParse(input);
  if (!parsed.success) return;

  await deleteExercise(userId, parsed.data.exerciseId);

  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

// ── Add set ─────────────────────────────────────────────────────────────────

const addSetSchema = z.object({
  exerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
});

export type AddSetInput = z.infer<typeof addSetSchema>;

export type AddSetResult = {
  error: Partial<Record<keyof AddSetInput, string[]>>;
};

export async function addSetAction(
  input: AddSetInput
): Promise<AddSetResult | void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = addSetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: z.flattenError(parsed.error).fieldErrors };
  }

  const setNumber = (await countSetsInExercise(parsed.data.exerciseId)) + 1;
  await createSet(
    userId,
    parsed.data.exerciseId,
    setNumber,
    parsed.data.reps,
    parsed.data.weight
  );

  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

// ── Delete set ──────────────────────────────────────────────────────────────

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export async function deleteSetAction(input: DeleteSetInput): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = deleteSetSchema.safeParse(input);
  if (!parsed.success) return;

  await deleteSet(userId, parsed.data.setId);

  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}
