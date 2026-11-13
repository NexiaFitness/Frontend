/**
 * FormCombobox.tsx — Select estilo botón con dropdown popover
 *
 * Diseño: Botón con borde, flecha derecha, popover con opciones.
 * El listado se renderiza con portal + position fixed para no quedar recortado
 * por ancestros con overflow-hidden (p. ej. tarjetas del constructor de sesión).
 * H10: `invalid` marca el error del campo (aria-invalid + borde destructive), como Input.
 *
 * @author Frontend Team
 * @since v2.2.0
 */

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformFormControlVariant } from "./platformFormPresentation";
import { platformFormControlClass } from "./platformFormPresentation";

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
    buttonClassName?: string;
    size?: "xs" | "sm" | "md" | "lg";
    variant?: PlatformFormControlVariant;
    ariaLabel?: string;
    /** id del botón trigger (E2E / label htmlFor). */
    id?: string;
    /** El campo tiene un error: borde destructive y aria-invalid. El texto lo pinta el formulario. */
    invalid?: boolean;
    /** id del texto de error, para aria-describedby. */
    describedBy?: string;
}

const sizeStyles = {
    xs: "h-8 px-2 text-xs",
    sm: "h-9 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-9 px-5 text-sm",
};

type PopoverCoords = { top: number; left: number; width: number; maxHeight: number };

export const FormCombobox: React.FC<FormComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar",
    disabled = false,
    className,
    buttonClassName,
    size = "sm",
    variant = "default",
    ariaLabel,
    id,
    invalid = false,
    describedBy,
}) => {
    const autoId = useId();
    const instanceId = id ?? autoId;
    const listboxId = `${instanceId}-listbox`;
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [coords, setCoords] = useState<PopoverCoords>({
        top: 0,
        left: 0,
        width: 0,
        maxHeight: 320,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const wasOpenRef = useRef(false);

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
        const maxHeight = Math.max(1, Math.min(rawMax, 480));
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
        if (open && !wasOpenRef.current) {
            const selected = options.findIndex((option) => option.value === value);
            setActiveIndex(selected >= 0 ? selected : 0);
        }
        wasOpenRef.current = open;
    }, [open, options, value]);

    useEffect(() => {
        if (!open || !popoverRef.current) return;
        const node = popoverRef.current.querySelector<HTMLElement>(
            `[data-option-index="${activeIndex}"]`
        );
        const scroller = node?.parentElement;
        if (!node || !scroller) return;
        const top = node.offsetTop;
        const bottom = top + node.offsetHeight;
        if (top < scroller.scrollTop) scroller.scrollTop = top;
        else if (bottom > scroller.scrollTop + scroller.clientHeight) {
            scroller.scrollTop = bottom - scroller.clientHeight;
        }
    }, [open, activeIndex]);

    const focusTrigger = () => {
        triggerRef.current?.focus();
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setOpen(false);
        focusTrigger();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;
        if (!open) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
            }
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(0, index - 1));
        } else if (event.key === "Home") {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === "End") {
            event.preventDefault();
            setActiveIndex(Math.max(0, options.length - 1));
        } else if (event.key === "Enter") {
            event.preventDefault();
            const option = options[activeIndex];
            if (option) handleSelect(option.value);
        } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            focusTrigger();
        }
    };

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

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                ref={triggerRef}
                type="button"
                id={id}
                onClick={() => setOpen(!open)}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-activedescendant={
                    open ? `${instanceId}-option-${activeIndex}` : undefined
                }
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex w-full items-center justify-between rounded-md border border-border bg-surface-2 ring-offset-background",
                    "placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground",
                    sizeStyles[size],
                    platformFormControlClass(variant),
                    invalid && "border-destructive focus:border-destructive",
                    buttonClassName,
                )}
            >
                <span className="truncate">{displayText}</span>
                <ChevronDown
                    className={cn(
                        "opacity-50 shrink-0 ml-1",
                        size === "xs" ? "h-3 w-3" : "h-4 w-4"
                    )}
                />
            </button>

            {open &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={popoverRef}
                        id={listboxId}
                        role="listbox"
                        onKeyDown={handleKeyDown}
                        className="fixed z-[300] w-max overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg"
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
                            {options.map((option, index) => (
                                <button
                                    key={option.value}
                                    id={`${instanceId}-option-${index}`}
                                    type="button"
                                    role="option"
                                    data-option-index={index}
                                    aria-selected={value === option.value}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        (value === option.value || index === activeIndex) && "bg-accent"
                                    )}
                                >
                                    <span className="flex-1 truncate text-left">{option.label}</span>
                                    {value === option.value && (
                                        <Check className="h-4 w-4 shrink-0" />
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
