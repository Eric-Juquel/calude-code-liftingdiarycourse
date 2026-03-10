"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { createWorkoutAction, type CreateWorkoutInput, type CreateWorkoutResult } from "./actions";

export function NewWorkoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<CreateWorkoutResult["error"]>({});
  const [date, setDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  function handleDateSelect(d: Date | undefined) {
    if (!d) return;
    setDate(d);
    setCalendarOpen(false);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const now = new Date();
    const startedAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      now.getHours(),
      now.getMinutes()
    );

    const input: CreateWorkoutInput = {
      name: (data.get("name") as string) || undefined,
      startedAt,
    };

    startTransition(async () => {
      const result = await createWorkoutAction(input);
      if (result?.error) {
        setErrors(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Push Day"
          maxLength={100}
          disabled={isPending}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 sm:w-auto"
              disabled={isPending}
            >
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              {formatDate(date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
          </PopoverContent>
        </Popover>
        {errors.startedAt && (
          <p className="text-sm text-red-500">{errors.startedAt[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create workout"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
