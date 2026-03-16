---
name: workout-chart
description: >
  Generates a monthly workout bar chart from the lifting diary PostgreSQL database.
  Use this skill whenever the user wants to visualize, chart, or plot their workout history,
  frequency, or activity over time — even if they just say "show me my workouts", "how often
  did I train this year", "generate a workout report", or "plot my gym sessions". Always trigger
  when the user wants any kind of chart, graph, or visual summary of their workout data.
---

# Workout Chart Generator

Queries the lifting diary database for all workouts in the past 12 months, groups them by month,
and produces a bar chart image (`workout_chart.png`) in the current working directory.

## How to run

Execute the bundled Python script using the Bash tool:

```bash
python3 <skill-dir>/scripts/generate_chart.py [output_path]
```

- `output_path` is optional and defaults to `workout_chart.png` in the current directory.
- The script auto-discovers the `.env` file by walking up from the current working directory.
- It reads `DATABASE_URL` from `.env` to connect to the PostgreSQL database.

## What the script does

1. Finds and parses `.env` to get `DATABASE_URL`.
2. Connects to the database via `psycopg2`.
3. Runs:
   ```sql
   SELECT DATE_TRUNC('month', started_at) AS month, COUNT(*) AS count
   FROM workouts
   WHERE started_at >= NOW() - INTERVAL '1 year'
   GROUP BY month
   ORDER BY month
   ```
4. Plots a bar chart (matplotlib, headless/Agg backend) with months on the X axis and workout count on the Y axis.
5. Saves the image and prints the absolute output path.

## Dependencies

Ensure these Python packages are installed:

```bash
pip install psycopg2-binary matplotlib
```

If either is missing, the script will print a clear install instruction and exit.

## After running

Tell the user where the image was saved and offer to open it or embed it in the conversation if possible.
