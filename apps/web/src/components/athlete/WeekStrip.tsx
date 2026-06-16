/**
 * WeekStrip.tsx — Mini calendario semanal inicio atleta.
 * Contexto: portal atleta F0, V01 UX.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface WeekStripProps {
    days: WeekDayStripItem[];
}

export const WeekStrip: React.FC<WeekStripProps> = ({ days }) => {
    const navigate = useNavigate();

    return (
        <section aria-label="Esta semana">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Esta semana</h2>
            <div className="grid grid-cols-7 gap-1.5">
                {days.map((day) => {
                    const hasCompleted = day.sessions.some((s) => s.status === "completed");
                    const hasPlanned = day.sessions.length > 0;
                    const isRest = !hasPlanned;

                    return (
                        <button
                            key={day.dateKey}
                            type="button"
                            onClick={() =>
                                navigate("/dashboard/sessions", {
                                    state: { filterDate: day.dateKey },
                                })
                            }
                            className={cn(
                                "flex min-h-touch-athlete flex-col items-center justify-center rounded-lg border px-0.5 py-2 text-center transition-colors",
                                day.isToday
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-border bg-card text-foreground hover:bg-surface-2"
                            )}
                        >
                            <span className="text-caption text-muted-foreground">{day.label}</span>
                            <span className="text-sm font-semibold tabular-nums">{day.dayNumber}</span>
                            <span className="mt-0.5 flex h-3 items-center justify-center">
                                {hasCompleted ? (
                                    <Check className="size-3 text-success" aria-label="Completada" />
                                ) : hasPlanned ? (
                                    <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                                ) : isRest ? (
                                    <span className="text-caption text-muted-foreground">·</span>
                                ) : null}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
