"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";

interface DatePickerProps {
  readonly selected: Date;
}

export function DatePicker({ selected }: DatePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    setOpen(false);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    router.push(`/dashboard?date=${y}-${m}-${day}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 sm:w-auto"
        >
          <CalendarIcon className="h-4 w-4 text-zinc-500" />
          {formatDate(selected)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
