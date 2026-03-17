/**
 * FormCombobox.tsx — Selector tipo combobox (botón + dropdown)
 *
 * Diseño Lovable: botón con valor seleccionado, chevron, dropdown al hacer clic.
 * Reemplaza el aspecto del FormSelect nativo por un trigger estilo Radix.
 *
 * @example
 * <FormCombobox
 *   value={selectedId?.toString() ?? ""}
 *   onChange={(v) => setSelectedId(v ? Number(v) : null)}
 *   options={[{ value: "", label: "Seleccionar..." }, ...]}
 *   placeholder="Seleccionar cliente *"
 * />
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface FormComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
}

export const FormCombobox: React.FC<FormComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar...",
    disabled = false,
    className,
    "aria-label": ariaLabel,
}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);
    const displayText = selectedOption?.label ?? placeholder;

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

    const handleSelect = (opt: ComboboxOption) => {
        if (opt.disabled) return;
        onChange(opt.value);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <button
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="none"
                aria-label={ariaLabel ?? placeholder}
                disabled={disabled}
                onClick={() => !disabled && setOpen(!open)}
                className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !selectedOption && "text-muted-foreground"
                )}
            >
                <span className="line-clamp-1 truncate">{displayText}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover py-1 shadow-lg"
                >
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={opt.value === value}
                            disabled={opt.disabled}
                            onClick={() => handleSelect(opt)}
                            className={cn(
                                "flex w-full cursor-pointer items-center px-3 py-2 text-sm outline-none",
                                "hover:bg-accent hover:text-accent-foreground",
                                opt.value === value && "bg-accent text-accent-foreground",
                                opt.disabled && "cursor-not-allowed opacity-50"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

FormCombobox.displayName = "FormCombobox";
