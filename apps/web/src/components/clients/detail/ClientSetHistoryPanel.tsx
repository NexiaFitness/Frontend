/**
 * ClientSetHistoryPanel — Historial expandible por serie (F8 TR-01).
 */

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import {
    useClientSetHistory,
    type SetHistoryDateRangeWeeks,
} from "@nexia/shared/hooks/clients/useClientSetHistory";
import type { ClientSetExecutionRow, ClientTimedBlockResultRow } from "@nexia/shared/types/trainerSetExecutions";
import {
    formatSetExecutionLabel,
    formatSetExecutionLine,
} from "@nexia/shared/utils/trainer/formatSetExecutionDisplay";
import {
    formatTimedBlockModeLabel,
    formatTimedBlockResultTitle,
    formatTimedBlockResultValue,
} from "@nexia/shared/utils/trainer/formatTimedBlockResultDisplay";
import { ClientExerciseLoadPanel } from "./ClientExerciseLoadPanel";
import {
    SET_HISTORY_EMPTY_DESCRIPTION,
    SET_HISTORY_SUBTITLE,
} from "./clientSetHistoryPresentation";
import { FormCombobox } from "@/components/ui/forms";
import { Alert, EmptyState, LoadingSpinner } from "@/components/ui/feedback";

export interface ClientSetHistoryPanelProps {
    clientId: number;
    initialExerciseId?: number | null;
}

const DATE_RANGE_OPTIONS: { weeks: SetHistoryDateRangeWeeks; label: string }[] = [
    { weeks: 4, label: "Últimas 4 semanas" },
    { weeks: 8, label: "Últimas 8 semanas" },
    { weeks: 12, label: "Últimas 12 semanas" },
];

function formatSessionTitle(
    sessionName: string | null,
    sessionDate: string | null,
): string {
    const dateLabel = sessionDate
        ? new Date(sessionDate).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
          })
        : "Sin fecha";
    return sessionName ? `${sessionName} — ${dateLabel}` : dateLabel;
}

function formatSetLabel(row: ClientSetExecutionRow): string {
    return formatSetExecutionLabel(row);
}

function formatSetLine(row: ClientSetExecutionRow): string {
    return formatSetExecutionLine(row);
}

function SessionAccordion({
    sessionKey,
    title,
    timedBlocks,
    exercises,
    defaultOpen,
}: {
    sessionKey: number;
    title: string;
    timedBlocks: ClientTimedBlockResultRow[];
    exercises: ReturnType<typeof useClientSetHistory>["sessions"][number]["exercises"];
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen ?? false);
    const hasContent = timedBlocks.length > 0 || exercises.length > 0;

    return (
        <div className="rounded-lg border border-border bg-card">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex min-h-12 w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                aria-expanded={open}
            >
                {open ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span className="text-sm font-medium text-foreground">{title}</span>
            </button>
            {open && hasContent && (
                <div className="space-y-4 border-t border-border px-4 py-3">
                    {timedBlocks.length > 0 && (
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Bloques a tiempo
                            </p>
                            <ul className="mt-2 space-y-1">
                                {timedBlocks.map((block) => (
                                    <li
                                        key={block.id}
                                        className="flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-md bg-muted/20 px-3 py-2 text-sm"
                                    >
                                        <span className="font-medium text-foreground">
                                            {formatTimedBlockResultTitle(block)}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {formatTimedBlockModeLabel(block.timed_mode)} ·{" "}
                                            {formatTimedBlockResultValue(block)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {exercises.map((exercise) => (
                        <div key={`${sessionKey}-${exercise.exerciseId}`}>
                            <p className="text-sm font-semibold text-foreground">
                                {exercise.exerciseName}
                            </p>
                            <ul className="mt-2 space-y-1">
                                {exercise.sets.map((setRow) => (
                                    <li
                                        key={setRow.id}
                                        className="flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-md bg-muted/20 px-3 py-2 text-sm"
                                    >
                                        <span className="font-medium text-foreground">
                                            {formatSetLabel(setRow)}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {formatSetLine(setRow)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export const ClientSetHistoryPanel: React.FC<ClientSetHistoryPanelProps> = ({
    clientId,
    initialExerciseId = null,
}) => {
    const [exerciseId, setExerciseId] = useState<number | "">(
        initialExerciseId ?? "",
    );
    const [dateRangeWeeks, setDateRangeWeeks] =
        useState<SetHistoryDateRangeWeeks>(4);

    useEffect(() => {
        if (initialExerciseId != null) {
            setExerciseId(initialExerciseId);
        }
    }, [initialExerciseId]);

    const resolvedExerciseId = exerciseId === "" ? null : exerciseId;

    const { sessions, total, exerciseOptions, isLoading, isEmpty, error } =
        useClientSetHistory({
            clientId,
            exerciseId: resolvedExerciseId,
            dateRangeWeeks,
        });

    const filterControls = useMemo(
        () => (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Ejercicio</span>
                    <FormCombobox
                        value={exerciseId === "" ? "" : String(exerciseId)}
                        onChange={(value) =>
                            setExerciseId(value === "" ? "" : Number(value))
                        }
                        options={[
                            { value: "", label: "Todos los ejercicios" },
                            ...exerciseOptions.map((opt) => ({
                                value: String(opt.id),
                                label: opt.name,
                            })),
                        ]}
                        placeholder="Todos los ejercicios"
                        ariaLabel="Filtrar por ejercicio"
                        size="sm"
                    />
                </div>
                <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Periodo</span>
                    <FormCombobox
                        value={String(dateRangeWeeks)}
                        onChange={(value) =>
                            setDateRangeWeeks(
                                Number(value) as SetHistoryDateRangeWeeks,
                            )
                        }
                        options={DATE_RANGE_OPTIONS.map((opt) => ({
                            value: String(opt.weeks),
                            label: opt.label,
                        }))}
                        ariaLabel="Filtrar por periodo"
                        size="sm"
                    />
                </div>
            </div>
        ),
        [exerciseId, exerciseOptions, dateRangeWeeks],
    );

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                    <Dumbbell className="size-5 text-primary" aria-hidden />
                    <h3 className="text-sm font-semibold text-foreground">
                        Historial por serie
                    </h3>
                </div>
                <div className="flex min-h-[120px] items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-border bg-card p-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Historial por serie</h3>
                <Alert variant="error">
                    No se pudo cargar el historial por serie. Intenta de nuevo.
                </Alert>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <Dumbbell className="size-5 text-primary" aria-hidden />
                    <h3 className="text-sm font-semibold text-foreground">
                        Historial por serie
                    </h3>
                    {total > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {total} registro{total === 1 ? "" : "s"}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    {SET_HISTORY_SUBTITLE}
                </p>
            </div>

            {filterControls}

            {resolvedExerciseId != null && (
                <ClientExerciseLoadPanel
                    clientId={clientId}
                    exerciseId={resolvedExerciseId}
                    exerciseName={
                        exerciseOptions.find((o) => o.id === resolvedExerciseId)?.name
                    }
                    weeks={dateRangeWeeks}
                />
            )}

            {isEmpty ? (
                <EmptyState
                    title="Sin registros por serie aún"
                    description={SET_HISTORY_EMPTY_DESCRIPTION}
                />
            ) : (
                <div className="space-y-2">
                    {sessions.map((session, index) => (
                        <SessionAccordion
                            key={session.trainingSessionId}
                            sessionKey={session.trainingSessionId}
                            title={formatSessionTitle(
                                session.sessionName,
                                session.sessionDate,
                            )}
                            timedBlocks={session.timedBlocks}
                            exercises={session.exercises}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
