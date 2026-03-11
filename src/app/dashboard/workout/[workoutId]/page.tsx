import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const id = Number(workoutId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Workout
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Update your workout details.
          </p>
        </div>

        <EditWorkoutForm
          workoutId={workout.id}
          defaultName={workout.name}
          defaultStartedAt={workout.startedAt}
        />
      </div>
    </div>
  );
}
