/**
 * useTabNavigation.ts — Hook reutilizable para navegación de tabs con query parameters
 *
 * Contexto:
 * - Hook profesional para gestionar tabs con URLs compartibles
 * - Sincroniza estado del tab con query parameters (?tab=overview)
 * - Soporta validación de tabs válidos
 * - Type-safe con TypeScript
 *
 * Responsabilidades:
 * - Leer tab inicial desde query params
 * - Actualizar URL al cambiar tab
 * - Validar que el tab sea válido
 * - Mantener sincronización URL ↔ estado
 *
 * Uso:
 * ```tsx
 * const { activeTab, setActiveTab } = useTabNavigation<TabId>(
 *   ['overview', 'details', 'settings'],
 *   'overview' // default
 * );
 * ```
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export interface UseTabNavigationOptions<T extends string> {
    /**
     * Lista de tabs válidos para validación
     */
    validTabs: readonly T[];
    /**
     * Tab por defecto si no hay query param o es inválido
     */
    defaultTab: T;
    /**
     * Nombre del query parameter (default: 'tab')
     */
    paramName?: string;
    /**
     * Si debe actualizar la URL al cambiar tab (default: true)
     */
    updateUrl?: boolean;
}

export interface UseTabNavigationReturn<T extends string> {
    /**
     * Tab activo actual
     */
    activeTab: T;
    /**
     * Función para cambiar el tab activo
     */
    setActiveTab: (tab: T) => void;
    /**
     * Si el tab actual es válido
     */
    isValid: boolean;
}

/**
 * Hook para navegación de tabs con query parameters
 *
 * @example
 * ```tsx
 * type TabId = "overview" | "details" | "settings";
 * const TABS: TabId[] = ["overview", "details", "settings"];
 *
 * const { activeTab, setActiveTab } = useTabNavigation<TabId>({
 *   validTabs: TABS,
 *   defaultTab: "overview",
 * });
 * ```
 */
export function useTabNavigation<T extends string>(
    options: UseTabNavigationOptions<T>
): UseTabNavigationReturn<T> {
    const {
        validTabs,
        defaultTab,
        paramName = "tab",
        updateUrl = true,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Función para obtener tab inicial desde query params o location.state
    const getInitialTab = useCallback((): T => {
        // 1. Intentar desde location.state (navegación programática)
        const stateTab = (location.state as { tab?: T } | null)?.tab;
        if (stateTab && validTabs.includes(stateTab)) {
            return stateTab;
        }

        // 2. Intentar desde query params
        const queryTab = searchParams.get(paramName) as T | null;
        if (queryTab && validTabs.includes(queryTab)) {
            return queryTab;
        }

        // 3. Default
        return defaultTab;
    }, [location.state, searchParams, paramName, validTabs, defaultTab]);

    const [activeTab, setActiveTabState] = useState<T>(getInitialTab);

    // Sincronizar con cambios en URL (navegación del navegador)
    useEffect(() => {
        const newTab = getInitialTab();
        if (newTab !== activeTab) {
            setActiveTabState(newTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, location.state]);

    // Función para cambiar tab
    const setActiveTab = useCallback(
        (tab: T) => {
            // Validar tab
            if (!validTabs.includes(tab)) {
                console.warn(`Invalid tab: ${tab}. Valid tabs are:`, validTabs);
                return;
            }

            setActiveTabState(tab);

            // Actualizar URL si está habilitado
            if (updateUrl) {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set(paramName, tab);
                setSearchParams(newSearchParams, { replace: true });
            }
        },
        [validTabs, updateUrl, searchParams, paramName, setSearchParams]
    );

    const isValid = validTabs.includes(activeTab);

    return {
        activeTab,
        setActiveTab,
        isValid,
    };
}

