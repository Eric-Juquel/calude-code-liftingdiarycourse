"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().max(100).optional(),
  startedAt: z.coerce.date(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export type CreateWorkoutResult = {
  error: Partial<Record<keyof CreateWorkoutInput, string[]>>;
};

export async function createWorkoutAction(
  input: CreateWorkoutInput
): Promise<CreateWorkoutResult | void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: z.flattenError(parsed.error).fieldErrors };
  }

  await createWorkout(userId, parsed.data.name ?? null, parsed.data.startedAt);

  redirect("/dashboard");
}
