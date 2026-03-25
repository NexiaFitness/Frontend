/**
 * FormCombobox.tsx — Select estilo botón con dropdown popover
 *
 * Diseño: Botón con borde, flecha derecha, popover con opciones.
 * Reemplaza el select nativo para un look más moderno tipo shadcn/ui.
 *
 * @author Frontend Team
 * @since v2.2.0
 */

import React, { useState, useRef, useEffect } from "react";
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
    sm: "h-8 px-2.5 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base",
};

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
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

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

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-lg">
                    <div className="max-h-60 overflow-auto py-1 scrollbar-primary">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
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
                </div>
            )}
        </div>
    );
};
