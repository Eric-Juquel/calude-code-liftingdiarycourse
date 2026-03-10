import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewWorkoutForm } from "./NewWorkoutForm";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            New Workout
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Log a new workout session.
          </p>
        </div>

        <NewWorkoutForm />
      </div>
    </div>
  );
}
