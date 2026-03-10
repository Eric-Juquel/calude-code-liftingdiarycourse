import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { getWorkoutsByUserAndDate } from "@/data/workouts";
import { DatePicker } from "./DatePicker";

interface DashboardPageProps {
  readonly searchParams: Promise<{ readonly date?: string }>;
}

function parseDuration(startedAt: Date, completedAt: Date | null): string | null {
  if (!completedAt) return null;
  const minutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);
  return `${minutes} min`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;
  const today = new Date();
  const date = dateParam
    ? (() => { const [y, m, d] = dateParam.split("-").map(Number); return new Date(y, m - 1, d); })()
    : new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const workoutList = await getWorkoutsByUserAndDate(date);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            View your workouts by date.
          </p>
        </div>

        <DatePicker selected={date} />

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Workouts — {formatDate(date)}
          </h2>

          {workoutList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
              <Dumbbell className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No workouts logged for this date.
              </p>
            </div>
          ) : (
            workoutList.map((workout) => {
              const duration = parseDuration(workout.startedAt, workout.completedAt);
              return (
                <Card key={workout.id} className="shadow-none">
                  <CardHeader className="pb-1 pt-4">
                    <CardTitle className="text-base font-medium">
                      {workout.name ?? "Untitled Workout"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {workout.exerciseCount} exercise{workout.exerciseCount === 1 ? "" : "s"}
                      {duration ? ` · ${duration}` : ""}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
