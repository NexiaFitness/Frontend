/**
 * ClientAvatar.tsx — Avatar de cliente con color determinista por id
 *
 * Usa getClientAvatarColor de @nexia/shared (id % 5 → primary|success|warning|destructive|info).
 * Solo para clientes; no modificar avatares de coach/admin.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { getClientAvatarColor, getClientInitials } from "@nexia/shared";
import { cn } from "@/lib/utils";

const colorClasses: Record<string, string> = {
    primary: "bg-primary/20 text-primary",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    destructive: "bg-destructive/20 text-destructive",
    info: "bg-info/20 text-info",
};

const sizeClasses: Record<string, string> = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
};

interface ClientAvatarProps {
    clientId: number | string;
    nombre?: string | null;
    apellidos?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const ClientAvatar: React.FC<ClientAvatarProps> = ({
    clientId,
    nombre,
    apellidos,
    size = "md",
    className,
}) => {
    const color = getClientAvatarColor(clientId);
    const initials = getClientInitials(nombre, apellidos);
    const colorClass = colorClasses[color];
    const sizeClass = sizeClasses[size];

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-bold shadow-md",
                colorClass,
                sizeClass,
                className
            )}
        >
            {initials}
        </div>
    );
};
