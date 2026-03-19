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
import { createPortal } from "react-dom";
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
    /** sm = 58×30, sm62 = 62×30, sm8 = 58×32, sm62_8 = 62×32 (h-8 alineado con inputs) */
    size?: "sm" | "sm62" | "sm8" | "sm62_8" | "md";
    "aria-label"?: string;
}

export const FormCombobox: React.FC<FormComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar...",
    disabled = false,
    className,
    size = "md",
    "aria-label": ariaLabel,
}) => {
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = options.find((o) => o.value === value);
    const displayText = selectedOption?.label ?? placeholder;

    const updateDropdownPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                minWidth: rect.width,
                zIndex: 9999,
            });
        }
    };

    useEffect(() => {
        if (!open) return;
        updateDropdownPosition();
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (containerRef.current?.contains(target)) return;
            if (dropdownRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleOpen = () => {
        if (!disabled) {
            setOpen(true);
            requestAnimationFrame(updateDropdownPosition);
        }
    };

    const handleSelect = (opt: ComboboxOption) => {
        if (opt.disabled) return;
        onChange(opt.value);
        setOpen(false);
    };

    const dropdownContent = (
        <div
            ref={dropdownRef}
            role="listbox"
            style={dropdownStyle}
            className={cn(
                "max-h-60 overflow-auto rounded-md border border-border bg-popover py-1 shadow-lg",
                size === "sm" || size === "sm62" ? "text-[10px]" : "text-sm"
            )}
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
                        "flex w-full cursor-pointer items-center outline-none",
                        "hover:bg-accent hover:text-accent-foreground",
                        opt.value === value && "bg-accent text-accent-foreground",
                        opt.disabled && "cursor-not-allowed opacity-50",
                        (size === "sm" || size === "sm62" || size === "sm8" || size === "sm62_8")
                            ? "px-2 py-1.5 truncate"
                            : "px-3 py-2"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative",
                (size === "sm" || size === "sm8") ? "w-[58px] shrink-0" : (size === "sm62" || size === "sm62_8") ? "w-[62px] shrink-0" : "w-full",
                className
            )}
        >
            <button
                ref={buttonRef}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="none"
                data-state={open ? "open" : "closed"}
                aria-label={ariaLabel ?? placeholder}
                disabled={disabled}
                onClick={handleOpen}
                className={cn(
                    "flex items-center justify-between rounded-md border ring-offset-background",
                    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !selectedOption && "text-muted-foreground",
                    size === "sm"
                        ? "h-[30px] w-[58px] shrink-0 px-2 py-1.5 text-[10px] bg-surface border-border/60"
                        : size === "sm62"
                        ? "h-[30px] w-[62px] shrink-0 px-2 py-1.5 text-[10px] bg-surface border-border/60"
                        : size === "sm8"
                        ? "h-8 w-[58px] shrink-0 px-2 py-1.5 text-[10px] bg-surface border-border/60"
                        : size === "sm62_8"
                        ? "h-8 w-[62px] shrink-0 px-2 py-1.5 text-[10px] bg-surface border-border/60"
                        : "h-9 w-full px-3 py-2 text-sm border-input bg-background"
                )}
            >
                <span className="line-clamp-1 truncate">{displayText}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
            </button>

            {open && createPortal(dropdownContent, document.body)}
        </div>
    );
};

FormCombobox.displayName = "FormCombobox";
