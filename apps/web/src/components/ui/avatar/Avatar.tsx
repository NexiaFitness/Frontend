/**
 * Avatar.tsx — Componente reutilizable para mostrar avatares con iniciales
 *
 * Contexto:
 * - Muestra avatar circular con iniciales del nombre y apellido
 * - Soporta diferentes tamaños y variantes de color
 * - Calcula iniciales automáticamente o acepta iniciales pre-calculadas
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React, { useMemo } from "react";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarVariant = "default" | "primary" | "custom";

interface AvatarProps {
    nombre?: string;
    apellidos?: string;
    initials?: string; // Si se proporciona, se usa directamente
    size?: AvatarSize;
    variant?: AvatarVariant;
    customColor?: string; // Para variant="custom"
    className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
};

const variantStyles: Record<AvatarVariant, string> = {
    default: "bg-gradient-to-br from-[#4A67B3] via-[#3a5db3] to-[#2d4a9e]",
    primary: "bg-primary-100 text-primary-600",
    custom: "",
};

export const Avatar: React.FC<AvatarProps> = ({
    nombre,
    apellidos,
    initials,
    size = "md",
    variant = "default",
    customColor,
    className = "",
}) => {
    // Calcular iniciales
    const calculatedInitials = useMemo(() => {
        if (initials) {
            return initials.toUpperCase();
        }
        if (nombre || apellidos) {
            const first = nombre?.charAt(0)?.toUpperCase() || "";
            const last = apellidos?.charAt(0)?.toUpperCase() || "";
            return `${first}${last}` || "—";
        }
        return "—";
    }, [nombre, apellidos, initials]);

    // Estilos inline para variant custom
    const customStyle = variant === "custom" && customColor
        ? { background: customColor }
        : undefined;

    const baseClasses = "rounded-full flex items-center justify-center text-white font-bold shadow-md";
    const sizeClass = sizeClasses[size];
    const variantClass = variant === "custom" ? "" : variantStyles[variant];
    const textColorClass = variant === "primary" ? "text-primary-600" : "text-white";

    return (
        <div
            className={`${baseClasses} ${sizeClass} ${variantClass} ${textColorClass} ${className}`}
            style={customStyle}
        >
            {calculatedInitials}
        </div>
    );
};

