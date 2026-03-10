# UI Coding Standards

## Component Library

**ONLY shadcn/ui components are to be used for UI throughout this project.**

- Do NOT create custom UI components (buttons, inputs, cards, dialogs, etc.)
- Do NOT use any other component library (MUI, Chakra, Radix directly, etc.)
- All UI primitives must come from shadcn/ui
- If a needed component is not yet installed, add it via the CLI: `npx shadcn@latest add <component>`

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

### Format Convention

Dates must be formatted using ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2024
3rd Jan 2026
4th Mar 2026
```

### Implementation

Use `format` and `getDate` from `date-fns` together with a helper to produce the ordinal suffix:

```ts
import { format } from "date-fns";

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}
```

This utility should be placed in `src/lib/format-date.ts` and imported wherever dates need to be displayed.
