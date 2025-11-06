/**
 * Hook específico para navegación pública con lógica contextual
 * Maneja visibilidad de links basado en la ruta actual
 * Reutilizable entre web y React Native
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { useMemo } from 'react';
import { NavigationItem, NAVIGATION_CONFIG } from '../config/navigationConfig';
import { ROUTES } from '../config/constants';

export interface UsePublicNavigationProps {
    currentPath: string;
}

export interface UsePublicNavigationReturn {
    visibleNavigationItems: NavigationItem[];
    isHomePage: boolean;
    currentPageTitle: string | null;
    hasVisibleItems: boolean;
}

/**
 * Hook para obtener navegación pública filtrada según contexto
 */
export const usePublicNavigation = ({
    currentPath
}: UsePublicNavigationProps): UsePublicNavigationReturn => {

    // Verificar si estamos en homepage - optimizado sin useMemo
    const isHomePage = currentPath === ROUTES.HOME;

    // Obtener título de página actual
    const currentPageTitle = useMemo(() => {
        const currentItem = NAVIGATION_CONFIG.public.find(item => item.path === currentPath);
        return currentItem?.label || null;
    }, [currentPath]);

    // Filtrar items de navegación basado en ruta actual
    const visibleNavigationItems = useMemo(() => {
        return NAVIGATION_CONFIG.public.filter(item => {
            // No mostrar el link de la página actual
            if (item.path === currentPath) {
                return false;
            }

            // En homepage, no mostrar "Inicio"
            if (isHomePage && item.path === ROUTES.HOME) {
                return false;
            }

            return true;
        });
    }, [currentPath, isHomePage]);

    // Verificar si hay items visibles
    const hasVisibleItems = visibleNavigationItems.length > 0;

    return {
        visibleNavigationItems,
        isHomePage,
        currentPageTitle,
        hasVisibleItems,
    };
};

/**
 * Hook simplificado para obtener solo items visibles
 */
export const useVisiblePublicNavigation = (currentPath: string): NavigationItem[] => {
    const { visibleNavigationItems } = usePublicNavigation({ currentPath });
    return visibleNavigationItems;
};

/**
 * Hook para verificar si un link específico debe ser visible
 */
export const useIsLinkVisible = (currentPath: string, linkPath: string): boolean => {
    return useMemo(() => {
        // No mostrar link de página actual
        if (currentPath === linkPath) return false;

        // En homepage, no mostrar "Inicio"
        if (currentPath === ROUTES.HOME && linkPath === ROUTES.HOME) return false;

        return true;
    }, [currentPath, linkPath]);
};