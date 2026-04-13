/**
 * FormCombobox.tsx — Select estilo botón con dropdown popover
 *
 * Diseño: Botón con borde, flecha derecha, popover con opciones.
 * El listado se renderiza con portal + position fixed para no quedar recortado
 * por ancestros con overflow-hidden (p. ej. tarjetas del constructor de sesión).
 *
 * @author Frontend Team
 * @since v2.2.0
 */

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
    value: string;
    label: string;
}

export interface FormComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const sizeStyles = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base",
};

type PopoverCoords = { top: number; left: number; width: number; maxHeight: number };

export const FormCombobox: React.FC<FormComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar",
    disabled = false,
    className,
    size = "md",
}) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<PopoverCoords>({
        top: 0,
        left: 0,
        width: 0,
        maxHeight: 240,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

    const updatePopoverPosition = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const gap = 4;
        const viewportPad = 8;
        const belowTop = r.bottom + gap;
        const spaceBelow = window.innerHeight - belowTop - viewportPad;
        const spaceAbove = r.top - viewportPad;
        const preferBelow = spaceBelow >= Math.min(120, spaceAbove);
        const rawMax = preferBelow ? spaceBelow : spaceAbove - gap;
        const maxHeight = Math.min(240, Math.max(1, rawMax));
        if (preferBelow) {
            setCoords({
                top: belowTop,
                left: r.left,
                width: r.width,
                maxHeight,
            });
        } else {
            setCoords({
                top: Math.max(viewportPad, r.top - gap - maxHeight),
                left: r.left,
                width: r.width,
                maxHeight,
            });
        }
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

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                disabled={disabled}
                className={cn(
                    "flex w-full items-center justify-between rounded-md border border-input bg-background py-2 ring-offset-background",
                    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground",
                    sizeStyles[size]
                )}
            >
                <span className="truncate">{displayText}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
            </button>

            {open &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={popoverRef}
                        role="listbox"
                        className="fixed z-[200] w-max rounded-md border border-border bg-popover p-1 shadow-lg"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            minWidth: coords.width,
                            maxHeight: coords.maxHeight + 8,
                        }}
                    >
                        <div
                            className="overflow-auto py-1 scrollbar-primary"
                            style={{ maxHeight: coords.maxHeight }}
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={value === option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        value === option.value && "bg-accent"
                                    )}
                                >
                                    <span className="flex-1 truncate text-left">{option.label}</span>
                                    {value === option.value && (
                                        <Check className="ml-2 h-4 w-4 shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};
