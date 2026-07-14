/**
 * WeekSessionSegmentBar.tsx — Progreso semanal en segmentos (read-only, eco V07).
 */

import React from "react";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { cn } from "@/lib/utils";
import {
    WEEK_STRIP_SEGMENT_EMPTY,
    WEEK_STRIP_SEGMENT_DONE,
    WEEK_STRIP_SEGMENT_MAX,
    WEEK_STRIP_SEGMENT_PENDING,
    WEEK_STRIP_SEGMENT_ROW,
    WEEK_STRIP_SEGMENT_TRACK,
} from "./weekStripPresentation";

export interface WeekSessionSegmentBarProps {
    done: number;
    planned: number;
    className?: string;
}

export const WeekSessionSegmentBar: React.FC<WeekSessionSegmentBarProps> = ({
    done,
    planned,
    className,
}) => {
    if (planned <= 0) {
        return null;
    }

    if (planned > WEEK_STRIP_SEGMENT_MAX) {
        const pct = Math.round((done / planned) * 100);
        return (
            <AthleteProgressBar
                value={pct}
                tone={done >= planned ? "success" : "primary"}
                className={className}
                aria-label={`${done} de ${planned} sesiones completadas esta semana`}
            />
        );
    }

    return (
        <div
            className={cn(WEEK_STRIP_SEGMENT_TRACK, className)}
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={planned}
            aria-label={`${done} de ${planned} sesiones completadas esta semana`}
        >
            <div className={WEEK_STRIP_SEGMENT_ROW}>
                {Array.from({ length: planned }, (_, index) => {
                    const isDone = index < done;
                    const isNext = index === done && done < planned;

                    return (
                        <div
                            key={index}
                            className={cn(
                                isDone
                                    ? WEEK_STRIP_SEGMENT_DONE
                                    : isNext
                                      ? WEEK_STRIP_SEGMENT_PENDING
                                      : WEEK_STRIP_SEGMENT_EMPTY
                            )}
                            aria-hidden
                        />
                    );
                })}
            </div>
        </div>
    );
};
