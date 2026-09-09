/**
 * DatePickerButton — Botón desplegable para selección de fecha
 *
 * Popover con portal + position fixed (paridad FormCombobox) para no quedar
 * recortado por ancestros overflow-hidden (glass cards del constructor).
 */

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

export interface DatePickerButtonProps {
    /** Etiqueta visible (ej. "Desde", "Hasta", "Seleccionar fecha") */
    label: string;
    /** Valor en formato YYYY-MM-DD */
    value: string;
    /** Callback al seleccionar fecha */
    onChange: (value: string) => void;
    /** Deshabilitado */
    disabled?: boolean;
    /** Clases adicionales */
    className?: string;
    /** aria-label para accesibilidad */
    "aria-label"?: string;
    /** Variante form: w-full, estilo trigger FormCombobox */
    variant?: "default" | "form";
}

type PopoverCoords = { top: number; left: number; width: number };

function formatDisplayDate(value: string): string {
    if (!value) return "";
    const d = new Date(value + "T12:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function toDate(value: string): Date | undefined {
    if (!value) return undefined;
    const d = new Date(value + "T12:00:00");
    return isNaN(d.getTime()) ? undefined : d;
}

function toYYYYMMDD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const CALENDAR_MIN_WIDTH = 280;
const CALENDAR_ESTIMATED_HEIGHT = 320;

export const DatePickerButton: React.FC<DatePickerButtonProps> = ({
    label,
    value,
    onChange,
    disabled = false,
    className,
    "aria-label": ariaLabel,
    variant = "default",
}) => {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState<Date>(toDate(value) ?? new Date());
    const [coords, setCoords] = useState<PopoverCoords>({ top: 0, left: 0, width: CALENDAR_MIN_WIDTH });
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const selectedDate = toDate(value);
    const displayText = value ? formatDisplayDate(value) : label;

    const updatePopoverPosition = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const gap = 4;
        const viewportPad = 8;
        const popoverWidth = Math.max(CALENDAR_MIN_WIDTH, r.width);
        const belowTop = r.bottom + gap;
        const spaceBelow = window.innerHeight - belowTop - viewportPad;
        const spaceAbove = r.top - viewportPad;
        const preferBelow = spaceBelow >= Math.min(CALENDAR_ESTIMATED_HEIGHT, spaceAbove);
        const top = preferBelow ? belowTop : Math.max(viewportPad, r.top - gap - CALENDAR_ESTIMATED_HEIGHT);
        let left = r.left;
        if (left + popoverWidth > window.innerWidth - viewportPad) {
            left = Math.max(viewportPad, window.innerWidth - viewportPad - popoverWidth);
        }
        setCoords({ top, left, width: popoverWidth });
    }, []);

    useLayoutEffect(() => {
        if (!open) return;
        updatePopoverPosition();
        const onReposition = () => updatePopoverPosition();
        window.addEventListener("resize", onReposition);
        window.addEventListener("scroll", onReposition, true);
        return () => {
            window.removeEventListener("resize", onReposition);
            window.removeEventListener("scroll", onReposition, true);
        };
    }, [open, updatePopoverPosition]);

    useEffect(() => {
        if (!open) return;
        const handlePointerDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (containerRef.current?.contains(t)) return;
            if (popoverRef.current?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    useEffect(() => {
        const date = toDate(value);
        if (date) {
            setMonth(date);
        }
    }, [value]);

    const handleSelect = (d: Date | undefined) => {
        if (d) {
            onChange(toYYYYMMDD(d));
            setOpen(false);
        }
    };

    const isFormVariant = variant === "form";

    const handlePreviousMonth = () => {
        setMonth((prev) => {
            const newMonth = new Date(prev);
            newMonth.setMonth(newMonth.getMonth() - 1);
            return newMonth;
        });
    };

    const handleNextMonth = () => {
        setMonth((prev) => {
            const newMonth = new Date(prev);
            newMonth.setMonth(newMonth.getMonth() + 1);
            return newMonth;
        });
    };

    const monthLabel = month
        .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        .replace(/\bde\b/gi, "")
        .trim();

    return (
        <div ref={containerRef} className={cn("relative", isFormVariant ? "w-full" : "inline-flex")}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                aria-label={ariaLabel ?? label}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    isFormVariant
                        ? cn(
                              "h-9 w-full justify-start border border-border bg-surface-2 px-3",
                              value ? "text-foreground" : "text-muted-foreground",
                          )
                        : cn(
                              "h-9 border border-primary/30 bg-transparent px-3 text-muted-foreground",
                              "hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)]",
                          ),
                    className,
                )}
            >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                <span className="truncate">{displayText}</span>
            </button>

            {open &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={popoverRef}
                        role="dialog"
                        aria-label="Seleccionar fecha"
                        className={cn(
                            "fixed z-[200] rounded-lg border border-border/80 bg-popover p-3 shadow-xl",
                            "backdrop-blur-md",
                        )}
                        style={{
                            top: coords.top,
                            left: coords.left,
                            minWidth: coords.width,
                            width: coords.width,
                        }}
                    >
                        <div className="mb-2 flex items-center justify-between gap-2 px-1">
                            <button
                                type="button"
                                onClick={handlePreviousMonth}
                                aria-label="Mes anterior"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-transparent text-primary opacity-80 transition-all hover:border-primary/50 hover:bg-primary/10 hover:opacity-100"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="flex-1 select-none text-center text-sm font-medium capitalize text-foreground">
                                {monthLabel}
                            </span>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                aria-label="Mes siguiente"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-transparent text-primary opacity-80 transition-all hover:border-primary/50 hover:bg-primary/10 hover:opacity-100"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                            month={month}
                            onMonthChange={setMonth}
                            locale={es}
                            showOutsideDays={false}
                            classNames={{
                                root: "rdp w-full p-0",
                                months: "flex w-full flex-col",
                                month: "w-full",
                                caption: "hidden",
                                caption_label: "hidden",
                                nav: "hidden",
                                month_caption: "hidden",
                                month_grid: "w-full border-collapse",
                                weekdays: "flex w-full",
                                weekday:
                                    "flex h-9 w-9 flex-1 items-center justify-center text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground",
                                week: "mt-1 flex w-full",
                                day: "relative flex h-9 w-9 flex-1 items-center justify-center p-0 text-sm",
                                day_button: cn(
                                    "inline-flex h-9 w-9 items-center justify-center rounded-md p-0 font-normal",
                                    "transition-colors hover:bg-primary/10 hover:text-primary",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                    "aria-selected:bg-primary aria-selected:text-primary-foreground",
                                ),
                                day_outside: "text-muted-foreground opacity-40",
                                day_today: "font-semibold text-primary",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                day_disabled: "opacity-40",
                                day_hidden: "invisible",
                            }}
                        />
                    </div>,
                    document.body,
                )}
        </div>
    );
};

DatePickerButton.displayName = "DatePickerButton";
