/**
 * InlineNumberInput.tsx — Input numérico compacto con botones Up/Down.
 * Contexto: usado en constructores; debe mantener en sync el padre (React) al pulsar
 * subir/bajar, incluido modo controlado donde el DOM y `HTMLInputElement.stepUp`
 * quedan desalineados con el prop `value`.
 * Notas: renderiza un `<input type="text" inputMode="numeric">` en lugar de un
 * input nativo `type="number"`, evitando que la validación nativa del navegador
 * bloquee estados intermedios (p. ej. borrar el primer dígito de "10").
 * La validación de `min`/`max`/`step` se aplica manualmente en los botones y en
 * `onBlur`, nunca mientras el usuario escribe.
 * @author Frontend Team
 * @since v8.1.0
 * @updated v8.2.0 — input no nativo con validación manual
 */

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineNumberSize = "xs" | "compact" | "sm" | "md" | "lg";

interface InlineNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: InlineNumberSize;
    className?: string;
}

const sizeStyles: Record<InlineNumberSize, string> = {
    compact: "h-7 px-1.5 py-1 pr-3.5 text-[11px] rounded-md border border-border/60 bg-surface",
    xs: "h-8 px-2 py-1.5 pr-4 text-xs rounded-md border border-border/60 bg-surface",
    sm: "h-9 px-2 py-1.5 pr-5 text-sm rounded-md border border-input bg-background",
    md: "h-10 px-2.5 py-2 pr-6 text-sm rounded-md border border-input bg-background sm:text-base",
    lg: "h-12 px-3 py-2.5 pr-7 text-base rounded-md border border-input bg-background",
};

const btnSizeStyles: Record<InlineNumberSize, string> = {
    compact: "w-3",
    xs: "w-3.5",
    sm: "w-4",
    md: "w-4",
    lg: "w-5",
};

const iconSizeStyles: Record<InlineNumberSize, string> = {
    compact: "h-2 w-2",
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3 w-3",
    lg: "h-4 w-4",
};

function parseNumberAttr(
    v: string | number | undefined | null
): { ok: true; n: number } | { ok: false } {
    if (v === "" || v === undefined || v === null) {
        return { ok: false };
    }
    const n = Number(v);
    if (Number.isNaN(n)) {
        return { ok: false };
    }
    return { ok: true, n };
}

function sanitizeNumericInput(raw: string): string {
    if (raw === "") {
        return "";
    }
    const digitsOnly = raw.replace(/\D/g, "");
    // Descartar ceros a la izquierda, excepto el propio "0".
    const withoutLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, "");
    return withoutLeadingZeros;
}

function clampNumericValue(
    raw: string,
    min: string | number | undefined,
    max: string | number | undefined
): string {
    if (raw === "") {
        return "";
    }
    const parsed = parseNumberAttr(raw);
    if (!parsed.ok) {
        return "";
    }
    const minP = parseNumberAttr(min);
    const maxP = parseNumberAttr(max);
    let clamped = parsed.n;
    if (minP.ok) {
        clamped = Math.max(clamped, minP.n);
    }
    if (maxP.ok) {
        clamped = Math.min(clamped, maxP.n);
    }
    return String(clamped);
}

/**
 * Alineado con el comportamiento habitual de step: incremento fijo, clamp min/max.
 * Evita doble onChange (nativo + sintético) en inputs controlados.
 */
function applyNumberStep(
    p: {
        value: string | number | null | undefined;
        min: string | number | undefined;
        max: string | number | undefined;
        step: string | number | undefined;
        readOnly?: boolean;
        disabled?: boolean;
        elementValue: string;
    },
    direction: 1 | -1
): { next: string; changed: boolean } {
    if (p.readOnly || p.disabled) {
        return { next: p.elementValue, changed: false };
    }
    const stepP = parseNumberAttr(p.step);
    const stepSize = stepP.ok && stepP.n > 0 ? stepP.n : 1;
    const minP = parseNumberAttr(p.min);
    const maxP = parseNumberAttr(p.max);

    let current: number;
    if (p.value === "" || p.value == null) {
        const fromDom = parseNumberAttr(p.elementValue);
        if (fromDom.ok) {
            current = fromDom.n;
        } else if (minP.ok) {
            current = minP.n;
        } else {
            current = 0;
        }
    } else {
        const fromProp = parseNumberAttr(p.value);
        if (fromProp.ok) {
            current = fromProp.n;
        } else if (minP.ok) {
            current = minP.n;
        } else {
            const fromDom = parseNumberAttr(p.elementValue);
            current = fromDom.ok ? fromDom.n : 0;
        }
    }

    const rawNext = direction === 1 ? current + stepSize : current - stepSize;
    let clamped = rawNext;
    if (minP.ok) {
        clamped = Math.max(clamped, minP.n);
    }
    if (maxP.ok) {
        clamped = Math.min(clamped, maxP.n);
    }

    const next = String(clamped);
    if (clamped === current) {
        return { next, changed: false };
    }
    return { next, changed: true };
}

export const InlineNumberInput = forwardRef<HTMLInputElement, InlineNumberInputProps>(
    ({ size = "sm", className, onChange, onBlur, ...inputProps }, ref) => {
        const innerRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

        const { min, max, step, readOnly, disabled, value } = inputProps;

        const runStep = (dir: 1 | -1) => {
            if (!onChange) {
                return;
            }
            const el = innerRef.current;
            const v = value;
            const valueForStep: string | number | null | undefined = Array.isArray(v)
                ? undefined
                : (v as string | number | null | undefined);
            const { next, changed } = applyNumberStep(
                {
                    value: valueForStep,
                    min,
                    max,
                    step,
                    readOnly,
                    disabled,
                    elementValue: el?.value ?? "",
                },
                dir
            );
            if (!changed) {
                return;
            }
            onChange({
                target: { value: next } as EventTarget & HTMLInputElement,
                currentTarget: el as HTMLInputElement,
            } as React.ChangeEvent<HTMLInputElement>);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!onChange) {
                return;
            }
            const raw = e.target.value;
            const sanitized = sanitizeNumericInput(raw);
            if (sanitized === raw) {
                onChange(e);
                return;
            }
            onChange({
                ...e,
                target: { ...e.target, value: sanitized } as EventTarget & HTMLInputElement,
                currentTarget: e.currentTarget,
            } as React.ChangeEvent<HTMLInputElement>);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            const clamped = clampNumericValue(raw, min, max);
            if (clamped !== raw && onChange) {
                onChange({
                    ...e,
                    target: { ...e.target, value: clamped } as EventTarget & HTMLInputElement,
                    currentTarget: e.currentTarget,
                } as React.ChangeEvent<HTMLInputElement>);
            }
            onBlur?.(e);
        };

        return (
            <div className={cn("relative inline-flex", className)}>
                <input
                    ref={innerRef}
                    className={cn(
                        "block w-full rounded-md border text-foreground transition-colors placeholder:text-muted-foreground caret-primary focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:cursor-not-allowed disabled:opacity-50 text-center",
                        sizeStyles[size],
                        "nexia-no-native-spinners"
                    )}
                    {...inputProps}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <div
                    className={cn(
                        "absolute inset-y-0 right-0 flex flex-col overflow-hidden rounded-r-md border-l border-border/40",
                        btnSizeStyles[size]
                    )}
                >
                    <button
                        type="button"
                        onClick={() => runStep(1)}
                        className="flex flex-1 items-center justify-center text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="Incrementar"
                        disabled={disabled || readOnly}
                    >
                        <ChevronUp className={iconSizeStyles[size]} aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => runStep(-1)}
                        className="flex flex-1 items-center justify-center border-t border-border/40 text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="Decrementar"
                        disabled={disabled || readOnly}
                    >
                        <ChevronDown className={iconSizeStyles[size]} aria-hidden />
                    </button>
                </div>
            </div>
        );
    }
);

InlineNumberInput.displayName = "InlineNumberInput";
