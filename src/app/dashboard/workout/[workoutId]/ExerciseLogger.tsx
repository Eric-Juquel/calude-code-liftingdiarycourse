"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExerciseWithSets } from "@/data/exercises";
import {
  addExerciseAction,
  deleteExerciseAction,
  addSetAction,
  deleteSetAction,
  type AddExerciseResult,
  type AddSetResult,
} from "./actions";

type Props = {
  workoutId: number;
  exercises: ExerciseWithSets[];
};

function AddSetForm({
  exerciseId,
  workoutId,
}: {
  exerciseId: number;
  workoutId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<AddSetResult["error"]>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const reps = Number(data.get("reps"));
    const weight = Number(data.get("weight"));

    startTransition(async () => {
      const result = await addSetAction({ exerciseId, workoutId, reps, weight });
      if (result?.error) {
        setErrors(result.error);
      } else {
        form.reset();
        setErrors({});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 pt-2">
      <div className="space-y-1">
        <Label htmlFor={`reps-${exerciseId}`} className="text-xs">
          Reps
        </Label>
        <Input
          id={`reps-${exerciseId}`}
          name="reps"
          type="number"
          min={1}
          placeholder="10"
          className="w-20"
          disabled={isPending}
        />
        {errors.reps && (
          <p className="text-xs text-red-500">{errors.reps[0]}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor={`weight-${exerciseId}`} className="text-xs">
          Weight (kg)
        </Label>
        <Input
          id={`weight-${exerciseId}`}
          name="weight"
          type="number"
          min={0}
          step={0.5}
          placeholder="60"
          className="w-24"
          disabled={isPending}
        />
        {errors.weight && (
          <p className="text-xs text-red-500">{errors.weight[0]}</p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Adding…" : "Add Set"}
      </Button>
    </form>
  );
}

export function ExerciseLogger({ workoutId, exercises }: Readonly<Props>) {
  const [isPending, startTransition] = useTransition();
  const [addErrors, setAddErrors] = useState<AddExerciseResult["error"]>({});

  function handleAddExercise(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name") as string;

    startTransition(async () => {
      const result = await addExerciseAction({ workoutId, name });
      if (result?.error) {
        setAddErrors(result.error);
      } else {
        form.reset();
        setAddErrors({});
      }
    });
  }

  function handleDeleteExercise(exerciseId: number) {
    startTransition(async () => {
      await deleteExerciseAction({ exerciseId, workoutId });
    });
  }

  function handleDeleteSet(setId: number) {
    startTransition(async () => {
      await deleteSetAction({ setId, workoutId });
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Exercises
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Log exercises and sets for this workout.
        </p>
      </div>

      {/* Add exercise form */}
      <form onSubmit={handleAddExercise} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1 flex-1 min-w-48">
          <Label htmlFor="exercise-name" className="text-sm">
            Exercise name
          </Label>
          <Input
            id="exercise-name"
            name="name"
            type="text"
            placeholder="e.g. Bench Press"
            maxLength={100}
            disabled={isPending}
          />
          {addErrors.name && (
            <p className="text-sm text-red-500">{addErrors.name[0]}</p>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add Exercise"}
        </Button>
      </form>

      {/* Exercise list */}
      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No exercises yet. Add one above.
        </p>
      ) : (
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-base font-medium">
                  {exercise.name}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDeleteExercise(exercise.id)}
                  aria-label={`Delete ${exercise.name}`}
                >
                  <Trash2 className="h-4 w-4 text-zinc-500" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {exercise.sets.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="pb-1 pr-4 font-medium">Set</th>
                        <th className="pb-1 pr-4 font-medium">Reps</th>
                        <th className="pb-1 pr-4 font-medium">Weight (kg)</th>
                        <th className="pb-1 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set) => (
                        <tr
                          key={set.id}
                          className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                        >
                          <td className="py-1.5 pr-4 text-zinc-700 dark:text-zinc-300">
                            {set.setNumber}
                          </td>
                          <td className="py-1.5 pr-4 text-zinc-700 dark:text-zinc-300">
                            {set.reps}
                          </td>
                          <td className="py-1.5 pr-4 text-zinc-700 dark:text-zinc-300">
                            {set.weight}
                          </td>
                          <td className="py-1.5 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleDeleteSet(set.id)}
                              aria-label={`Delete set ${set.setNumber}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-zinc-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <AddSetForm exerciseId={exercise.id} workoutId={workoutId} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
