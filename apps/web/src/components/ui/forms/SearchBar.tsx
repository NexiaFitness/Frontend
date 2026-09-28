/**
 * SearchBar.tsx — Input de búsqueda reutilizable
 *
 * Usa tokens NEXIA_FORM_CONTROL_* para tipografía y altura consistentes en toda la app.
 */

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEXIA_FORM_CONTROL_SEARCH, NEXIA_FORM_CONTROL_SEARCH_ICON, NEXIA_FORM_CONTROL_SEARCH_WRAP } from "./formControlPresentation";

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
    onFocus?: () => void;
    onClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "Buscar...",
    ariaLabel = "Buscar",
    className = "",
    onFocus,
    onClick,
}) => (
    <div className={cn(NEXIA_FORM_CONTROL_SEARCH_WRAP, className)} onClick={onClick}>
        <Search className={NEXIA_FORM_CONTROL_SEARCH_ICON} aria-hidden />
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onClick={onClick}
            placeholder={placeholder}
            className={NEXIA_FORM_CONTROL_SEARCH}
            aria-label={ariaLabel}
        />
    </div>
);
