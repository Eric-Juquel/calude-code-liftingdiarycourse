"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { formatDate } from "@/lib/format-date";

const MOCK_WORKOUTS = [
  { id: 1, name: "Morning Push Day", exercises: 6, duration: "55 min" },
  { id: 2, name: "Bench Press PR Attempt", exercises: 3, duration: "30 min" },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

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

        {/* Date Picker */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 sm:w-auto">
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              {formatDate(date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Workout List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Workouts — {formatDate(date)}
          </h2>

          {MOCK_WORKOUTS.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
              <Dumbbell className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No workouts logged for this date.
              </p>
            </div>
          ) : (
            MOCK_WORKOUTS.map((workout) => (
              <Card key={workout.id} className="shadow-none">
                <CardHeader className="pb-1 pt-4">
                  <CardTitle className="text-base font-medium">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {workout.exercises} exercises · {workout.duration}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
