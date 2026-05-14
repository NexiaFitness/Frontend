/**
 * TimePickerButton — Selector de hora desplegable con lista de slots
 *
 * Mismo estilo visual que DatePickerButton variant="form".
 * Genera slots cada `step` minutos (default 15).
 * Scroll automático al slot seleccionado al abrir.
 *
 * @example
 * <TimePickerButton label="Hora inicio" value={startTime} onChange={setStartTime} />
 */

import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimePickerButtonProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
    step?: number;
    minTime?: string;
    maxTime?: string;
}

function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
}

function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateSlots(step: number, minTime?: string, maxTime?: string): string[] {
    const slots: string[] = [];
    const min = minTime ? timeToMinutes(minTime) : 0;
    const max = maxTime ? timeToMinutes(maxTime) : 24 * 60 - step;
    for (let m = min; m <= max; m += step) {
        slots.push(minutesToTime(m));
    }
    return slots;
}

export const TimePickerButton: React.FC<TimePickerButtonProps> = ({
    label,
    value,
    onChange,
    disabled = false,
    className,
    "aria-label": ariaLabel,
    step = 15,
    minTime,
    maxTime,
}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLButtonElement>(null);

    const slots = generateSlots(step, minTime, maxTime);

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

    useEffect(() => {
        if (open && selectedRef.current) {
            selectedRef.current.scrollIntoView({ block: "center" });
        }
    }, [open]);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                aria-label={ariaLabel ?? label}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    "inline-flex items-center gap-1.5 w-full justify-start",
                    "h-9 px-3 text-xs font-medium rounded-md",
                    "border border-border bg-surface hover:bg-surface-2",
                    "transition-all duration-200 ease-out",
                    "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    value ? "text-foreground" : "text-muted-foreground"
                )}
            >
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span className="text-sm">{value || label}</span>
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-border bg-popover shadow-lg scrollbar-primary"
                    role="listbox"
                    aria-label="Seleccionar hora"
                >
                    {slots.map((slot) => {
                        const isSelected = slot === value;
                        return (
                            <button
                                key={slot}
                                ref={isSelected ? selectedRef : undefined}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(slot);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-1.5 text-left text-sm transition-colors",
                                    isSelected
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

TimePickerButton.displayName = "TimePickerButton";
