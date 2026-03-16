"""
Queries the lifting diary database for workouts over the past year
and generates a bar chart saved as workout_chart.png.
"""

import os
import sys
import re
from datetime import datetime

# ── 1. Load DATABASE_URL from .env ───────────────────────────────────────────

def find_env_file():
    """Walk up from cwd looking for a .env file."""
    current = os.getcwd()
    for _ in range(6):  # look up to 6 levels
        candidate = os.path.join(current, ".env")
        if os.path.isfile(candidate):
            return candidate
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent
    return None

def load_database_url():
    env_path = find_env_file()
    if not env_path:
        print("ERROR: Could not find a .env file in the current directory or its parents.", file=sys.stderr)
        sys.exit(1)

    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                return line[len("DATABASE_URL="):].strip().strip('"').strip("'")

    print("ERROR: DATABASE_URL not found in .env file.", file=sys.stderr)
    sys.exit(1)

# ── 2. Query the database ─────────────────────────────────────────────────────

def fetch_monthly_counts(database_url: str) -> list[tuple]:
    """Returns list of (month_date, count) tuples sorted by month."""
    try:
        import psycopg2
    except ImportError:
        print("ERROR: psycopg2 is not installed. Run: pip install psycopg2-binary", file=sys.stderr)
        sys.exit(1)

    sql = """
        SELECT
            DATE_TRUNC('month', started_at) AS month,
            COUNT(*)                        AS count
        FROM workouts
        WHERE started_at >= NOW() - INTERVAL '1 year'
        GROUP BY month
        ORDER BY month
    """

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
    finally:
        conn.close()

    return rows  # [(datetime, int), ...]

# ── 3. Plot ───────────────────────────────────────────────────────────────────

def plot_chart(rows: list[tuple], output_path: str = "workout_chart.png"):
    try:
        import matplotlib
        matplotlib.use("Agg")  # headless – no display required
        import matplotlib.pyplot as plt
        import matplotlib.ticker as ticker
    except ImportError:
        print("ERROR: matplotlib is not installed. Run: pip install matplotlib", file=sys.stderr)
        sys.exit(1)

    if not rows:
        print("No workout data found for the past year. Chart not generated.")
        sys.exit(0)

    labels = [row[0].strftime("%b %Y") for row in rows]
    counts = [int(row[1]) for row in rows]

    fig, ax = plt.subplots(figsize=(max(8, len(labels) * 0.9), 5))

    bars = ax.bar(labels, counts, color="#4F83CC", edgecolor="white", linewidth=0.6)

    # Value labels on top of each bar
    for bar, count in zip(bars, counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.15,
            str(count),
            ha="center", va="bottom", fontsize=9, fontweight="bold"
        )

    ax.set_xlabel("Month", fontsize=11)
    ax.set_ylabel("Number of Workouts", fontsize=11)
    ax.set_title("Workouts per Month (Past 12 Months)", fontsize=13, fontweight="bold")
    ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    ax.set_ylim(0, max(counts) * 1.2)
    plt.xticks(rotation=30, ha="right", fontsize=9)
    plt.tight_layout()

    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    print(f"Chart saved to: {os.path.abspath(output_path)}")

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    output = sys.argv[1] if len(sys.argv) > 1 else "workout_chart.png"
    db_url = load_database_url()
    rows = fetch_monthly_counts(db_url)
    plot_chart(rows, output)
