/**
 * ClientSessionPickDayPanel — Guía «Nueva sesión» sin plan activo (paridad BlockCalendarRangeHint).
 */

import React from "react";
import { CalendarDays, Target } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    PLANNING_CREATE_BLOCK_ACTIVE_HINT,
    PLANNING_CREATE_BLOCK_DESCRIPTION,
    PLANNING_CREATE_BLOCK_FOOTER_STACK,
    PLANNING_CREATE_BLOCK_GLOW,
    PLANNING_CREATE_BLOCK_HINT_DOT,
    PLANNING_CREATE_BLOCK_HINT_ITEM,
    PLANNING_CREATE_BLOCK_HINTS,
    PLANNING_CREATE_BLOCK_ICON_WRAP,
    PLANNING_CREATE_BLOCK_IDLE_BODY,
    PLANNING_CREATE_BLOCK_META,
    PLANNING_CREATE_BLOCK_PANEL_CLASS,
    PLANNING_CREATE_BLOCK_PANEL_INNER,
    PLANNING_CREATE_BLOCK_STAT_ROW,
    PLANNING_CREATE_BLOCK_TITLE,
} from "@/components/trainingPlans/periodization/planningShellPresentation";

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

const PICK_DAY_HINTS = [
    "Sin plan activo puedes crear sesiones libres o vinculadas más adelante.",
    "Si el día ya tiene sesión, al hacer clic abriremos su detalle.",
] as const;

interface Props {
    selectedDate: string | null;
    onCreateSession: () => void;
}

export const ClientSessionPickDayPanel: React.FC<Props> = ({
    selectedDate,
    onCreateSession,
}) => (
    <article
        className={PLANNING_CREATE_BLOCK_PANEL_CLASS}
        data-testid="client-session-pick-day-panel"
    >
        <NexiaGlassAccentRim />
        {!selectedDate ? <div className={PLANNING_CREATE_BLOCK_GLOW} aria-hidden /> : null}

        <div className={PLANNING_CREATE_BLOCK_PANEL_INNER}>
            <p className={PLANNING_CREATE_BLOCK_META}>Nueva sesión</p>

            {!selectedDate ? (
                <div className={PLANNING_CREATE_BLOCK_IDLE_BODY}>
                    <div className={PLANNING_CREATE_BLOCK_ICON_WRAP}>
                        <Target className="size-6" aria-hidden />
                    </div>
                    <h4 className={PLANNING_CREATE_BLOCK_TITLE}>Selecciona un día</h4>
                    <p className={PLANNING_CREATE_BLOCK_DESCRIPTION}>
                        Haz clic en un día del calendario para fijar la fecha y crear una sesión
                        de entrenamiento para este cliente.
                    </p>

                    <div className={PLANNING_CREATE_BLOCK_HINTS}>
                        {PICK_DAY_HINTS.map((hint) => (
                            <p key={hint} className={PLANNING_CREATE_BLOCK_HINT_ITEM}>
                                <span className={PLANNING_CREATE_BLOCK_HINT_DOT} aria-hidden />
                                <span>{hint}</span>
                            </p>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col pt-4">
                    <div className={PLANNING_CREATE_BLOCK_ICON_WRAP}>
                        <CalendarDays className="size-6" aria-hidden />
                    </div>
                    <h4 className={cn(PLANNING_CREATE_BLOCK_TITLE, "mt-4")}>Día seleccionado</h4>
                    <p
                        className={cn(
                            PLANNING_CREATE_BLOCK_DESCRIPTION,
                            "mt-2 max-w-none text-left",
                        )}
                    >
                        Revisa la fecha o elige otro día en el calendario.
                    </p>

                    <div className={cn(PLANNING_CREATE_BLOCK_STAT_ROW, "mt-5")}>
                        <span className="text-muted-foreground">Fecha</span>
                        <span className="font-medium text-foreground">
                            {formatDateShort(selectedDate)}
                        </span>
                    </div>

                    <div className={PLANNING_CREATE_BLOCK_FOOTER_STACK}>
                        <p className={cn(PLANNING_CREATE_BLOCK_ACTIVE_HINT, "text-left")}>
                            Pulsa Crear sesión para abrir el constructor con esta fecha.
                        </p>
                        <div className="flex justify-end">
                            <Button type="button" size="sm" onClick={onCreateSession}>
                                Crear sesión
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </article>
);
