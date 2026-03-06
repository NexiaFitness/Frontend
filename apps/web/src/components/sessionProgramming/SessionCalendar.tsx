/**
 * SessionCalendar.tsx — Calendario mensual de sesiones de entrenamiento
 *
 * Contexto:
 * - Calendario simple sin librerías externas
 * - Muestra mes actual con navegación
 * - Badge "Session" en días con sesiones
 * - Grid responsive 7 columnas (Lun-Dom)
 * - Fase 3: opcional planningDays para mostrar origen (M/S/D) e is_trainable
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import React, { useMemo } from "react";
import type { PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { ResolvedDayPlan } from "@nexia/shared/types/planningCargas";

// Union type para compatibilidad durante transición
// Ambos tipos tienen campos compatibles para visualización (session_date, session_name, etc.)
type SessionCalendarSession = PlanTrainingSession | LegacyTrainingSession;

export interface SessionCalendarProps {
    sessions: SessionCalendarSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date, sessionsForDay: SessionCalendarSession[]) => void;
    /** Fase 3: datos de planificación del mes (un elemento por día). Si está definido, se muestra origen M/S/D e is_trainable. */
    planningDays?: ResolvedDayPlan[];
}

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

const SOURCE_LABEL: Record<string, string> = {
    month: "M",
    week: "S",
    day: "D",
};

/** Etiqueta semántica para el documento canónico §17 */
const SOURCE_SEMANTIC_LABEL: Record<string, string> = {
    month: "Heredado",
    week: "Override",
    day: "Override",
};

/** Color de la etiqueta según origen (tokens) */
const SOURCE_BADGE_CLASSES: Record<string, string> = {
    month: "bg-muted text-muted-foreground border-border",
    week: "bg-primary/10 text-primary border-primary/30",
    day: "bg-success/10 text-success border-success/30",
};

/** Parsea session_date (YYYY-MM-DD) como fecha local para evitar desfase por timezone */
function parseSessionDateLocal(sessionDate: string | null | undefined): Date | null {
    if (!sessionDate) return null;
    const match = String(sessionDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return new Date(sessionDate);
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
}

export const SessionCalendar: React.FC<SessionCalendarProps> = ({
    sessions,
    currentMonth,
    onMonthChange,
    onDateClick,
    planningDays,
}) => {
    // Obtener año y mes actual
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Obtener primer día del mes y último día
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Obtener día de la semana del primer día (0 = Domingo, ajustamos a Lunes = 0)
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Convierte Dom=0 a Lun=0

    // Mapa planning por día del mes (solo si planningDays está definido)
    const planningByDay = useMemo(() => {
        if (!planningDays || planningDays.length === 0) return new Map<number, ResolvedDayPlan>();
        const map = new Map<number, ResolvedDayPlan>();
        const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
        planningDays.forEach((plan) => {
            if (!plan.date || !plan.date.startsWith(monthStr)) return;
            const day = parseInt(plan.date.slice(8, 10), 10);
            if (day >= 1 && day <= 31) map.set(day, plan);
        });
        return map;
    }, [planningDays, year, month]);

    // Filtrar sesiones del mes actual (usar fecha local para evitar desfase por timezone)
    const sessionsInMonth = useMemo(() => {
        return sessions.filter((session) => {
            const sessionDate = parseSessionDateLocal(session.session_date);
            if (!sessionDate) return false;
            return (
                sessionDate.getFullYear() === year &&
                sessionDate.getMonth() === month
            );
        });
    }, [sessions, year, month]);

    // Crear mapa de sesiones por día
    const sessionsByDay = useMemo(() => {
        const map = new Map<number, SessionCalendarSession[]>();
        sessionsInMonth.forEach((session) => {
            const sessionDate = parseSessionDateLocal(session.session_date);
            if (!sessionDate) return;
            const day = sessionDate.getDate();
            if (!map.has(day)) {
                map.set(day, []);
            }
            map.get(day)!.push(session);
        });
        return map;
    }, [sessionsInMonth]);

    // Verificar si una fecha es hoy
    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    // Navegación de meses
    const handlePreviousMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        onMonthChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        onMonthChange(newDate);
    };

    // Manejar click en día
    const handleDateClick = (day: number) => {
        if (onDateClick) {
            const date = new Date(year, month, day);
            const sessionsForDay = sessionsByDay.get(day) || [];
            onDateClick(date, sessionsForDay);
        }
    };

    // Generar días del mes
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generar espacios vacíos al inicio para alinear el primer día
    const emptyDays = Array.from({ length: firstDayWeekday }, (_, i) => i);

    return (
        <div className="rounded-lg border border-border p-4 md:p-6">
            {/* Header con mes y navegación */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {MONTHS[month]} {year}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Mes anterior"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Mes siguiente"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Grid de días de la semana */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid de días del mes */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {/* Días vacíos al inicio */}
                {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Días del mes */}
                {days.map((day) => {
                    const hasSessions = sessionsByDay.has(day);
                    const plan = planningByDay.get(day);
                    const isCurrentDay = isToday(day);
                    const sourceLabel = plan?.source ? SOURCE_LABEL[plan.source] ?? plan.source : null;
                    const isTrainable = plan?.is_trainable ?? true;

                    return (
                        <div
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`
                                aspect-square
                                p-1 md:p-2
                                rounded-lg
                                border-2
                                transition-all
                                cursor-pointer
                                flex flex-col
                                items-center
                                justify-start
                                ${hasSessions
                                    ? "border-border bg-muted/30 hover:bg-muted/50"
                                    : "border-transparent hover:bg-muted/20"
                                }
                                ${isCurrentDay
                                    ? "border-primary ring-2 ring-primary/30"
                                    : ""
                                }
                                ${plan && !isTrainable ? "opacity-75" : ""}
                            `}
                        >
                            {/* Número del día */}
                            <span
                                className={`
                                    text-xs md:text-sm
                                    font-medium
                                    mb-1
                                    ${isCurrentDay
                                        ? "text-primary font-bold"
                                        : hasSessions
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    }
                                `}
                            >
                                {day}
                            </span>

                            {/* Badge "Sesión" si hay sesiones */}
                            {hasSessions && (
                                <span className="text-[10px] md:text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-medium border border-primary/30">
                                    Sesión
                                </span>
                            )}

                            {/* Origen planificación: M/S/D + Heredado/Override */}
                            {sourceLabel && plan?.source && (
                                <span
                                    className={`text-[10px] font-medium px-1 py-0.5 rounded border ${SOURCE_BADGE_CLASSES[plan.source] ?? "bg-warning/10 text-warning border-warning/30"}`}
                                    title={`${SOURCE_SEMANTIC_LABEL[plan.source] ?? plan.source} (${plan.source === "month" ? "Mes" : plan.source === "week" ? "Semana" : "Día"})`}
                                >
                                    {sourceLabel}
                                </span>
                            )}

                            {/* Volumen/Intensidad compactos */}
                            {plan && (plan.resolved_volume != null || plan.resolved_intensity != null) && (
                                <span className="text-[9px] text-muted-foreground leading-tight">
                                    {plan.resolved_volume != null ? `V${Math.round(plan.resolved_volume * 100)}` : ""}
                                    {plan.resolved_volume != null && plan.resolved_intensity != null ? "/" : ""}
                                    {plan.resolved_intensity != null ? `I${Math.round(plan.resolved_intensity * 100)}` : ""}
                                </span>
                            )}

                            {/* Día no entrenable */}
                            {plan && !isTrainable && (
                                <span className="text-[9px] font-medium text-destructive">
                                    No ent.
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-border bg-muted/50" />
                    <span>Programada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-success bg-success/20" />
                    <span>Completada</span>
                </div>
                {planningDays && planningDays.length > 0 && (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="px-1 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">M</span>
                            <span>Heredado (Mes)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-medium">S</span>
                            <span>Override (Semana)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-1 py-0.5 rounded bg-success/10 text-success border border-success/30 font-medium">D</span>
                            <span>Override (Día)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-destructive font-medium text-xs">No ent.</span>
                            <span>No entrenable</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

