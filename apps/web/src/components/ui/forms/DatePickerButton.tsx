/**
 * DatePickerButton — Botón desplegable para selección de fecha
 *
 * Diseño: outline transparente, borde cyan neón, hover con glow.
 * Al hacer clic abre un popover con calendario (react-day-picker).
 * Reutilizable en filtros, dashboards, formularios.
 *
 * @example
 * <DatePickerButton
 *   label="Desde"
 *   value={dateFrom}
 *   onChange={setDateFrom}
 * />
 */

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
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
    /** Variante form: w-full, bg-surface, estilo de input (spec CREATE_EDIT_SESSION) */
    variant?: "default" | "form";
}

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
    return d.toISOString().slice(0, 10);
}

const cyanButton =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)] bg-transparent p-0 opacity-50 hover:opacity-100 h-7 w-7";

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
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedDate = toDate(value);
    const displayText = value ? formatDisplayDate(value) : label;

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleSelect = (d: Date | undefined) => {
        if (d) {
            onChange(toYYYYMMDD(d));
            setOpen(false);
        }
    };

    const isFormVariant = variant === "form";

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
                    "inline-flex items-center gap-1.5",
                    "px-3 text-xs font-medium",
                    isFormVariant ? "min-h-[44px]" : "h-9",
                    "rounded-md",
                    "transition-all duration-200 ease-out",
                    "focus:outline-none focus:ring-0",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    isFormVariant
                        ? cn(
                            "w-full justify-start border border-border bg-surface hover:bg-surface-2 focus:border-primary",
                            value ? "text-foreground" : "text-muted-foreground"
                          )
                        : "border border-primary/30 text-muted-foreground bg-transparent hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)]",
                    className
                )}
            >
                <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {displayText}
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full z-50 mt-1 rounded-md border border-border bg-popover p-3 shadow-lg"
                    role="dialog"
                    aria-label="Seleccionar fecha"
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        defaultMonth={selectedDate ?? new Date()}
                        classNames={{
                            root: "rdp p-0",
                            months: "flex flex-col",
                            month: "space-y-4",
                            month_caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium",
                            nav: "flex items-center gap-1",
                            button_previous: cn(cyanButton, "absolute left-1"),
                            button_next: cn(cyanButton, "absolute right-1"),
                            month_grid: "w-full border-collapse space-y-1",
                            weekdays: "flex",
                            weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            week: "flex w-full mt-2",
                            day: "h-9 w-9 text-center text-sm p-0 relative",
                            day_button:
                                "inline-flex items-center justify-center h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                            day_today: "font-semibold",
                            day_selected: "bg-accent text-accent-foreground",
                            day_disabled: "opacity-50",
                            day_hidden: "invisible",
                        }}
                        components={{
                            Chevron: ({ orientation }) =>
                                orientation === "left" ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                ),
                        }}
                    />
                </div>
            )}
        </div>
    );
};

DatePickerButton.displayName = "DatePickerButton";
