/**
 * useSubTabNavigation.ts — Hook reutilizable para navegación de sub-tabs con query parameters
 *
 * Contexto:
 * - Hook para gestionar sub-tabs dentro de un tab principal
 * - Sincroniza con query parameters (?tab=planning&subtab=yearly)
 * - Soporta validación de sub-tabs válidos
 * - Type-safe con TypeScript
 *
 * Responsabilidades:
 * - Leer sub-tab inicial desde query params
 * - Actualizar URL al cambiar sub-tab
 * - Validar que el sub-tab sea válido
 * - Mantener sincronización URL ↔ estado
 *
 * Uso:
 * ```tsx
 * const { activeSubTab, setActiveSubTab } = useSubTabNavigation<SubTabId>(
 *   ['yearly', 'monthly', 'weekly'],
 *   'yearly' // default
 * );
 * ```
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export interface UseSubTabNavigationOptions<T extends string> {
    /**
     * Lista de sub-tabs válidos para validación
     */
    validSubTabs: readonly T[];
    /**
     * Sub-tab por defecto si no hay query param o es inválido
     */
    defaultSubTab: T;
    /**
     * Nombre del query parameter para sub-tab (default: 'subtab')
     */
    paramName?: string;
    /**
     * Si debe actualizar la URL al cambiar sub-tab (default: true)
     */
    updateUrl?: boolean;
}

export interface UseSubTabNavigationReturn<T extends string> {
    /**
     * Sub-tab activo actual
     */
    activeSubTab: T;
    /**
     * Función para cambiar el sub-tab activo
     */
    setActiveSubTab: (subTab: T) => void;
    /**
     * Si el sub-tab actual es válido
     */
    isValid: boolean;
}

/**
 * Hook para navegación de sub-tabs con query parameters
 *
 * @example
 * ```tsx
 * type SubTabId = "yearly" | "monthly" | "weekly";
 * const SUB_TABS: SubTabId[] = ["yearly", "monthly", "weekly"];
 *
 * const { activeSubTab, setActiveSubTab } = useSubTabNavigation<SubTabId>({
 *   validSubTabs: SUB_TABS,
 *   defaultSubTab: "yearly",
 * });
 * ```
 */
export function useSubTabNavigation<T extends string>(
    options: UseSubTabNavigationOptions<T>
): UseSubTabNavigationReturn<T> {
    const {
        validSubTabs,
        defaultSubTab,
        paramName = "subtab",
        updateUrl = true,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Función para obtener sub-tab inicial desde query params
    const getInitialSubTab = useCallback((): T => {
        // 1. Intentar desde location.state (navegación programática)
        const stateSubTab = (location.state as { subtab?: T } | null)?.subtab;
        if (stateSubTab && validSubTabs.includes(stateSubTab)) {
            return stateSubTab;
        }

        // 2. Intentar desde query params
        const querySubTab = searchParams.get(paramName) as T | null;
        if (querySubTab && validSubTabs.includes(querySubTab)) {
            return querySubTab;
        }

        // 3. Default
        return defaultSubTab;
    }, [location.state, searchParams, paramName, validSubTabs, defaultSubTab]);

    const [activeSubTab, setActiveSubTabState] = useState<T>(getInitialSubTab);

    // Sincronizar con cambios en URL (navegación del navegador)
    useEffect(() => {
        const newSubTab = getInitialSubTab();
        if (newSubTab !== activeSubTab) {
            setActiveSubTabState(newSubTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, location.state]);

    // Función para cambiar sub-tab
    const setActiveSubTab = useCallback(
        (subTab: T) => {
            // Validar sub-tab
            if (!validSubTabs.includes(subTab)) {
                console.warn(
                    `Invalid sub-tab: ${subTab}. Valid sub-tabs are:`,
                    validSubTabs
                );
                return;
            }

            setActiveSubTabState(subTab);

            // Actualizar URL si está habilitado
            if (updateUrl) {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set(paramName, subTab);
                setSearchParams(newSearchParams, { replace: true });
            }
        },
        [
            validSubTabs,
            updateUrl,
            searchParams,
            paramName,
            setSearchParams,
        ]
    );

    const isValid = validSubTabs.includes(activeSubTab);

    return {
        activeSubTab,
        setActiveSubTab,
        isValid,
    };
}

