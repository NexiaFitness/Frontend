/**
 * Breadcrumbs.tsx — Componente de navegación jerárquica
 *
 * Contexto:
 * - Proporciona contexto de ubicación al usuario
 * - Permite volver a niveles superiores (ej. Clientes > Atleta > Plan)
 *
 * Notas de mantenimiento:
 * - Tokens: text-muted-foreground, hover:text-primary, text-foreground.
 *
 * @author Frontend Team
 * @since v6.0.0
 * @updated v5.0.0 - Nexia Sparkle Flow: tokens
 */

import React from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
    label: string;
    path?: string;
    active?: boolean;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[]; // Opcional para evitar errores si no se pasan items
    className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [], className = "" }) => {
    // Defensa robusta contra items undefined/null o no-array
    const safeItems = Array.isArray(items) ? items : [];

    // Si no hay items, no renderizamos nada para evitar ruidos visuales
    if (safeItems.length === 0) return null;

    return (
        <nav className={`flex ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 text-xs sm:text-sm font-medium">
                {safeItems.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="mx-1 size-3.5 shrink-0 text-muted-foreground"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {item && item.path && !item.active ? (
                            <Link
                                to={item.path}
                                className="text-muted-foreground transition-colors hover:text-primary"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className={
                                    item?.active
                                        ? "font-semibold text-foreground"
                                        : "text-muted-foreground"
                                }
                                aria-current={item?.active ? "page" : undefined}
                            >
                                {item?.label || ""}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};
