#!/usr/bin/env python3
import csv
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "input" / "daily_log.csv"
OUT = ROOT / "output"
REQUIRED = {"date", "site", "work", "workers", "progress_pct", "note"}

with INPUT.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))

if not rows:
    raise SystemExit("input is empty")
missing = REQUIRED - set(rows[0])
if missing:
    raise SystemExit(f"missing columns: {sorted(missing)}")

by_date = defaultdict(list)
for row in rows:
    row["workers"] = int(row["workers"])
    row["progress_pct"] = float(row["progress_pct"])
    by_date[row["date"]].append(row)
OUT.mkdir(exist_ok=True)
summary_path = OUT / "progress_summary.csv"
with summary_path.open("w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["date", "site", "total_workers", "average_progress_pct"])
    for date, items in sorted(by_date.items()):
        workers = sum(x["workers"] for x in items)
        avg = sum(x["progress_pct"] for x in items) / len(items)
        w.writerow([date, items[0]["site"], workers, f"{avg:.1f}"])

lines = ["# 架空建設A現場 日報サマリー", ""]
for date, items in sorted(by_date.items()):
    workers = sum(x["workers"] for x in items)
    avg = sum(x["progress_pct"] for x in items) / len(items)
    lines += [f"## {date}", f"- 合計作業人数: {workers}人", f"- 平均進捗: {avg:.1f}%", ""]
    for x in items:
        lines += [f"### {x['work']}", f"- 人数: {x['workers']}人", f"- 進捗: {x['progress_pct']:.0f}%", f"- メモ: {x['note']}", ""]

report_path = OUT / "daily_report.md"
report_path.write_text("\n".join(lines), encoding="utf-8")
print(f"WROTE {summary_path}")
print(f"WROTE {report_path}")
