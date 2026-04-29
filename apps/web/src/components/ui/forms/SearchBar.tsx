/**
 * SearchBar.tsx — Input de búsqueda reutilizable (estilo ClientList)
 *
 * Contexto:
 * - Diseño consistente con ClientList: icono Search, tokens (border-border, bg-surface, text-foreground).
 * - Usado en vistas con listas: Clientes, Planes, Templates, etc.
 *
 * @author Frontend Team
 * @since v6.x
 */

import React from "react";
import { Search } from "lucide-react";

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "Buscar...",
    ariaLabel = "Buscar",
    className = "",
}) => (
    <div className={`relative w-full min-w-0 flex-1 sm:max-w-md ${className}`.trim()}>
        <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-muted-foreground"
            aria-hidden
        />
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-md border border-border bg-surface py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
            aria-label={ariaLabel}
        />
    </div>
);
