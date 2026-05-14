/**
 * ExerciseSearch.tsx — Barra de búsqueda con debounce para ejercicios
 *
 * Propósito: Input de búsqueda que emite eventos con debounce para evitar requests excesivos.
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness.
 * Notas de mantenimiento: mantener coherencia con ClientList y otras vistas
 *
 * @author Frontend Team
 * @since v4.8.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface ExerciseSearchProps {
    onSearch: (value: string) => void;
    /** Valor controlado desde fuera (p. ej. filters.search); al cambiar, el input se sincroniza */
    value?: string;
    placeholder?: string;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
    onSearch,
    value: controlledValue,
    placeholder = "Buscar ejercicios...",
}) => {
    const [localValue, setLocalValue] = useState(controlledValue ?? "");

    // Ref estable para onSearch: evita que el efecto de debounce se reprograme
    // cada vez que el padre re-renderiza con una nueva referencia de callback.
    const onSearchRef = useRef(onSearch);
    onSearchRef.current = onSearch;

    // Sincronizar con valor externo (p. ej. al pulsar "Limpiar")
    useEffect(() => {
        if (controlledValue !== undefined) {
            setLocalValue(controlledValue);
        }
    }, [controlledValue]);

    // Debounce: solo depende de localValue (no de onSearch)
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchRef.current(localValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue]);

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
            />
        </div>
    );
};
