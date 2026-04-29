/**
 * Input reutilizable para formularios UI Web
 * Basado en Tailwind CSS, soporta variantes y estados de validación
 * Integrado con react-hook-form para manejo profesional de formularios
 *
 * Features v2.0:
 * - Password visibility toggle con eye icon
 * - Accesibilidad completa (ARIA labels)
 * - Mobile-friendly touch targets
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v5.0.0 - Nexia Sparkle Flow: tokens, cn()
 * @updated v6.4.0 - size "compact" para paneles estrechos (ExercisePickerPanel)
 * @updated v8.1.0 - Botones custom Up/Down para type="number" con tokens primary, ocultando spinners nativos
 */

import React, { forwardRef, useId, useRef, useState, useImperativeHandle } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type InputType = "text" | "email" | "password" | "date" | "time" | "number" | "url" | "tel" | "search";
export type InputSize = "xs" | "compact" | "sm" | "md" | "lg";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    type?: InputType;
    size?: InputSize;
    label?: string;
    error?: string;
    isRequired?: boolean;
    helperText?: string;
}

const baseStyles =
    "block w-full rounded-md border border-input bg-background text-foreground transition-colors placeholder:text-muted-foreground caret-primary focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:cursor-not-allowed disabled:opacity-50";

// compact = paneles estrechos (ExercisePickerPanel); xs = chips; sm/md/lg = todos h-9 (slim unificado)
const sizeStyles: Record<InputSize, string> = {
    compact:
        "h-7 min-w-0 px-2 py-1 text-[11px] rounded-md border border-border/60 bg-surface",
    xs: "h-8 px-2.5 py-1.5 text-xs rounded-md border border-border/60 bg-surface",
    sm: "h-9 px-3 py-1.5 text-sm",
    md: "h-9 px-4 py-1.5 text-sm",
    lg: "h-9 px-5 py-1.5 text-sm",
};

// Para inputs password con icono → padding derecho extra
const passwordSizeStyles: Record<InputSize, string> = {
    compact: "h-7 px-2 py-1 pr-9 text-[11px]",
    xs: "h-8 px-2.5 py-1.5 pr-9 text-xs",
    sm: "h-9 px-3 py-1.5 pr-10 text-sm",
    md: "h-9 px-4 py-1.5 pr-12 text-sm",
    lg: "h-9 px-5 py-1.5 pr-14 text-sm",
};

// Para inputs number con botones custom → padding derecho extra
const numberSizeStyles: Record<InputSize, string> = {
    compact: "h-7 px-2 py-1 pr-3 text-[11px]",
    xs: "h-8 px-2 py-1.5 pr-3.5 text-xs",
    sm: "h-9 px-3 py-1.5 pr-4 text-sm",
    md: "h-9 px-4 py-1.5 pr-5 text-sm",
    lg: "h-9 px-5 py-1.5 pr-6 text-sm",
};

// Ancho del contenedor de botones Up/Down según tamaño (mimético a spinners nativos)
const numberBtnSizeStyles: Record<InputSize, string> = {
    compact: "w-3.5",
    xs: "w-3.5",
    sm: "w-4",
    md: "w-5",
    lg: "w-5",
};

// Tamaño del icono de flecha según tamaño del input
const numberIconSizeStyles: Record<InputSize, string> = {
    compact: "h-2.5 w-2.5",
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3 w-3",
    lg: "h-4 w-4",
};

const stateStyles = {
    default: "border-input focus:border-primary",
    defaultXs: "border-border/60 bg-surface focus:border-primary",
    error: "border-destructive focus:border-destructive",
};

const labelStyles = "block text-sm font-medium text-foreground mb-1";
const errorStyles = "mt-1 text-sm text-destructive";
const helperStyles = "mt-1 text-sm text-muted-foreground";

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = "text",
            size = "sm",
            label,
            error,
            isRequired = false,
            helperText,
            className = "",
            id,
            ...props
        },
        ref
    ) => {
        const autoId = useId();
        const inputId = id || (label ? `${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}` : autoId);
        const innerRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

        const [showPassword, setShowPassword] = useState(false);
        const isPasswordType = type === "password";
        const isNumberType = type === "number";
        const currentInputType = isPasswordType && showPassword ? "text" : type;

        const togglePasswordVisibility = () => setShowPassword(!showPassword);

        const handleStepUp = () => innerRef.current?.stepUp();
        const handleStepDown = () => innerRef.current?.stepDown();

        const inputSizeStyles = isPasswordType
            ? passwordSizeStyles[size]
            : isNumberType
            ? numberSizeStyles[size]
            : sizeStyles[size];

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className={labelStyles}>
                        {label}
                        {isRequired && <span className="text-destructive ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <input
                        ref={innerRef}
                        id={inputId}
                        type={currentInputType}
                        className={cn(
                            baseStyles,
                            inputSizeStyles,
                            error
                                ? stateStyles.error
                                : size === "xs" || size === "compact"
                                ? stateStyles.defaultXs
                                : stateStyles.default,
                            isNumberType && "nexia-no-native-spinners",
                            className
                        )}
                        {...props}
                    />

                    {isNumberType && (
                        <div className={cn(
                            "absolute inset-y-0 right-0 flex flex-col overflow-hidden rounded-r-md border-l border-border/40",
                            numberBtnSizeStyles[size]
                        )}>
                            <button
                                type="button"
                                onClick={handleStepUp}
                                className="flex flex-1 items-center justify-center text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                                aria-label="Incrementar"
                            >
                                <ChevronUp className={numberIconSizeStyles[size]} aria-hidden />
                            </button>
                            <button
                                type="button"
                                onClick={handleStepDown}
                                className="flex flex-1 items-center justify-center border-t border-border/40 text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                                aria-label="Decrementar"
                            >
                                <ChevronDown className={numberIconSizeStyles[size]} aria-hidden />
                            </button>
                        </div>
                    )}

                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:text-primary transition-colors"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            tabIndex={0}
                        >
                            {showPassword ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.132m0 0L21 21"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                {error ? (
                    <p className={errorStyles} data-testid="input-error">
                        {error}
                    </p>
                ) : (
                    helperText && <p className={helperStyles}>{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
