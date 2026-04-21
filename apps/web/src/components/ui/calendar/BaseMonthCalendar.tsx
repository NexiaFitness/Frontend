/**
 * BaseMonthCalendar.tsx — Calendario mensual reutilizable con design tokens
 *
 * Componente base que proporciona:
 * - Navegación de meses (anterior/siguiente)
 * - Cabecera de días de la semana (Lun-Dom)
 * - Grid 7 columnas con celdas personalizables via render prop
 *
 * Cada consumidor proporciona su propia renderización de celda:
 * - ScheduledSessionCalendar: mini-cards de sesiones agendadas
 * - SessionCalendar: badges de sesiones + origen de planificación
 * - PeriodizationCalendar: rangos de selección + bloques
 *
 * @author Frontend Team
 * @since v8.1.0
 */

import React, { useMemo } from "react";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

const MONTHS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

export interface CalendarDayInfo {
    date: Date;
    dayOfMonth: number;
    isToday: boolean;
    dateISO: string;
}

export interface BaseMonthCalendarProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    /** Render prop for each day cell. Return null to render an empty cell. */
    renderCell: (day: CalendarDayInfo) => React.ReactNode;
    /** Optional content rendered next to the month title (e.g. view toggle, counters). */
    headerRight?: React.ReactNode;
    /** Optional subtitle below the header (e.g. "X de Y días planificados"). */
    subtitle?: React.ReactNode;
    /** Optional footer below the grid (e.g. legend). */
    footer?: React.ReactNode;
    className?: string;
    /** Use compact cell aspect ratio (4/3) vs square. Default: false (square). */
    compactCells?: boolean;
}

function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
    const firstDay = new Date(year, month, 1);
    let startWeekday = firstDay.getDay();
    if (startWeekday === 0) startWeekday = 7;
    const blanks = startWeekday - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < blanks; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
}

export const BaseMonthCalendar: React.FC<BaseMonthCalendarProps> = ({
    currentMonth,
    onMonthChange,
    renderCell,
    headerRight,
    subtitle,
    footer,
    className = "",
    compactCells = false,
}) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const todayStr = toISO(new Date());

    const cells = useMemo(() => getMonthGrid(year, month), [year, month]);

    const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
    const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));

    const monthLabel = `${MONTHS[month]} ${year}`;

    return (
        <div className={`rounded-lg bg-surface p-5 space-y-3 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground transition-colors"
                        aria-label="Mes anterior"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h4 className="text-sm font-semibold capitalize text-foreground">{monthLabel}</h4>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground transition-colors"
                        aria-label="Mes siguiente"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                {headerRight}
            </div>

            {subtitle}

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-px mb-px">
                {WEEKDAYS.map((wd) => (
                    <div
                        key={wd}
                        className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        {wd}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden bg-border/30">
                {cells.map((cell, idx) => {
                    if (!cell) {
                        return (
                            <div
                                key={`blank-${idx}`}
                                className={compactCells ? "aspect-[4/3] bg-surface" : "bg-surface min-h-[80px] md:min-h-[100px]"}
                            />
                        );
                    }

                    const dateISO = toISO(cell);
                    const dayInfo: CalendarDayInfo = {
                        date: cell,
                        dayOfMonth: cell.getDate(),
                        isToday: dateISO === todayStr,
                        dateISO,
                    };

                    return (
                        <React.Fragment key={dateISO}>
                            {renderCell(dayInfo)}
                        </React.Fragment>
                    );
                })}
            </div>

            {footer}
        </div>
    );
};
