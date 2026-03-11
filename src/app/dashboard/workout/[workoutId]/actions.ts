"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { updateWorkout } from "@/data/workouts";

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

  redirect("/dashboard");
}
