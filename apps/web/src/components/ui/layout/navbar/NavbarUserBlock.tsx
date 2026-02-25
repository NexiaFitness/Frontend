/**
 * NavbarUserBlock — Nombre del usuario en gris y círculo con iniciales (avatar).
 *
 * Contexto: Pieza reutilizable de la navbar unificada para contexto dashboard.
 * Solo presentación; recibe user por props (desde store en el orquestador).
 *
 * Notas: Si user es null no se renderiza nada. Sin botones "Ver clientes" ni
 * "Nueva sesión". Iniciales = primera letra de nombre + primera de apellidos.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import clsx from "clsx";
import type { User } from "@nexia/shared/types/auth";

export interface NavbarUserBlockProps {
    user: User | null;
    className?: string;
}

function getInitials(nombre: string, apellidos: string): string {
    const n = (nombre?.trim() || "").charAt(0).toUpperCase();
    const a = (apellidos?.trim() || "").charAt(0).toUpperCase();
    return n && a ? `${n}${a}` : n || a || "";
}

export const NavbarUserBlock: React.FC<NavbarUserBlockProps> = ({
    user,
    className,
}) => {
    if (!user) {
        return null;
    }

    const displayName = [user.nombre, user.apellidos].filter(Boolean).join(" ");
    const initials = getInitials(user.nombre, user.apellidos);

    return (
        <div
            className={clsx(
                "flex items-center gap-3 shrink-0",
                className
            )}
            data-slot="navbar-user-block"
            data-testid="navbar-user-block"
        >
            <span
                className="hidden sm:block text-sm text-sidebar-foreground truncate max-w-[140px]"
                title={displayName}
            >
                {displayName}
            </span>
            <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium"
                aria-hidden="true"
            >
                {initials}
            </span>
        </div>
    );
};
