/**
 * aggregateExecutedLoadTrend — Buckets de tonnage ejecutado por periodo (F5-FE-02).
 */

import type { SessionExecutedLoadRow } from "../../types/trainerSetExecutions";

export type ExecutedLoadTrendPeriod = "weekly" | "monthly" | "annual";

export interface ExecutedLoadTrendBucket {
    label: string;
    tonnage_kg: number;
    sessions_count: number;
    sortKey: string;
}

const SHORT_MONTHS = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
];

function parseSessionDate(value: string | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfWeekMonday(d: Date): Date {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function formatWeekLabel(weekStart: Date): string {
    const mon = weekStart;
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    return `${mon.getDate()}–${sun.getDate()} ${SHORT_MONTHS[sun.getMonth()]}`;
}

function bucketKeyWeekly(d: Date): string {
    const mon = startOfWeekMonday(d);
    return mon.toISOString().split("T")[0];
}

function bucketKeyMonthly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function bucketKeyAnnual(d: Date): string {
    return String(d.getFullYear());
}

function labelForKey(key: string, period: ExecutedLoadTrendPeriod): string {
    if (period === "annual") return key;
    if (period === "monthly") {
        const [y, m] = key.split("-");
        const monthIndex = Number(m) - 1;
        return `${SHORT_MONTHS[monthIndex] ?? m} ${y?.slice(2) ?? ""}`.trim();
    }
    const mon = new Date(key);
    return formatWeekLabel(mon);
}

export function aggregateExecutedLoadByPeriod(
    bySession: SessionExecutedLoadRow[],
    period: ExecutedLoadTrendPeriod,
): ExecutedLoadTrendBucket[] {
    const buckets = new Map<
        string,
        { tonnage_kg: number; sessions_count: number }
    >();

    for (const row of bySession) {
        const sessionDate = parseSessionDate(row.session_date);
        if (!sessionDate) continue;

        const key =
            period === "weekly"
                ? bucketKeyWeekly(sessionDate)
                : period === "monthly"
                  ? bucketKeyMonthly(sessionDate)
                  : bucketKeyAnnual(sessionDate);

        const prev = buckets.get(key) ?? { tonnage_kg: 0, sessions_count: 0 };
        buckets.set(key, {
            tonnage_kg: prev.tonnage_kg + row.tonnage_kg,
            sessions_count: prev.sessions_count + 1,
        });
    }

    return Array.from(buckets.entries())
        .map(([sortKey, data]) => ({
            sortKey,
            label: labelForKey(sortKey, period),
            tonnage_kg: Math.round(data.tonnage_kg * 10) / 10,
            sessions_count: data.sessions_count,
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
