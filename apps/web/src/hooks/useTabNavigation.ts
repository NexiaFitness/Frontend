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

import { useState, useEffect, useCallback, useMemo } from "react";
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
    /**
     * Valores de URL legacy → tab canónico (p. ej. charts → analytics).
     * Si el query coincide con una clave, se reemplaza en la URL por el valor canónico.
     */
    tabAliases?: Partial<Record<string, T>>;
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
        tabAliases,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const resolveQueryTab = useCallback(
        (raw: string | null): T | null => {
            if (!raw) return null;
            const mapped =
                tabAliases && Object.prototype.hasOwnProperty.call(tabAliases, raw)
                    ? tabAliases[raw]
                    : (raw as T);
            return mapped && validTabs.includes(mapped) ? mapped : null;
        },
        [tabAliases, validTabs]
    );

    // Función para obtener tab inicial desde query params o location.state
    const getInitialTab = useCallback((): T => {
        // 1. Intentar desde location.state (navegación programática)
        const stateTab = (location.state as { tab?: T } | null)?.tab;
        if (stateTab && validTabs.includes(stateTab)) {
            return stateTab;
        }

        // 2. Intentar desde query params (incl. alias → tab canónico)
        const raw = searchParams.get(paramName);
        const fromAlias = resolveQueryTab(raw);
        if (fromAlias) {
            return fromAlias;
        }

        // 3. Default
        return defaultTab;
    }, [location.state, searchParams, paramName, validTabs, defaultTab, resolveQueryTab]);

    const aliasCanonicalPairs = useMemo(() => {
        if (!tabAliases) return [] as Array<{ raw: string; canonical: T }>;
        return Object.entries(tabAliases).map(([raw, canonical]) => ({
            raw,
            canonical: canonical as T,
        }));
    }, [tabAliases]);

    useEffect(() => {
        if (!updateUrl || !tabAliases || aliasCanonicalPairs.length === 0) return;
        const raw = searchParams.get(paramName);
        if (!raw) return;
        const pair = aliasCanonicalPairs.find((p) => p.raw === raw);
        if (!pair || !validTabs.includes(pair.canonical)) return;
        const next = new URLSearchParams(searchParams);
        next.set(paramName, pair.canonical);
        setSearchParams(next, { replace: true });
    }, [
        updateUrl,
        tabAliases,
        aliasCanonicalPairs,
        searchParams,
        paramName,
        setSearchParams,
        validTabs,
    ]);

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

