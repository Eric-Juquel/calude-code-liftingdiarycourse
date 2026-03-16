import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getExercisesWithSetsByWorkoutId } from "@/data/exercises";
import { EditWorkoutForm } from "./EditWorkoutForm";
import { ExerciseLogger } from "./ExerciseLogger";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const id = Number(workoutId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const [workout, exercises] = await Promise.all([
    getWorkoutById(id),
    getExercisesWithSetsByWorkoutId(id),
  ]);

  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {workout.name ?? "Workout"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your workout details and log exercises.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Workout details
          </h2>
          <EditWorkoutForm
            workoutId={workout.id}
            defaultName={workout.name}
            defaultStartedAt={workout.startedAt}
          />
        </section>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        <ExerciseLogger workoutId={workout.id} exercises={exercises} />
      </div>
    </div>
  );
}
