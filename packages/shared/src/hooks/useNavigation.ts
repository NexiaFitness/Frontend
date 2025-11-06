/**
 * Hook de navegación para gestión de menús y estado de navegación
 * Lógica pura reutilizable entre web y React Native
 * Maneja roles, estado del menú móvil y detección de rutas activas
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { useState, useMemo, useCallback } from 'react';
import { 
    NavigationItem, 
    getNavigationByRole, 
    getActiveNavigationItem, 
    isProtectedRoute 
} from '../config/navigationConfig';
import { USER_ROLES } from '../config/constants';

export interface UseNavigationProps {
    currentPath: string;
    userRole?: string;
}

export interface UseNavigationReturn {
    // Navigation items basados en rol
    navigationItems: NavigationItem[];
    publicNavigationItems: NavigationItem[];
    
    // Estado del menú móvil
    isMobileMenuOpen: boolean;
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleMobileMenu: () => void;
    
    // Item activo y estado de ruta
    activeItem: NavigationItem | null;
    isCurrentPathProtected: boolean;
    
    // Helpers de navegación
    isActiveRoute: (path: string) => boolean;
    shouldShowNavigation: boolean;
    isPublicRoute: boolean;
}

export const useNavigation = ({ 
    currentPath, 
    userRole 
}: UseNavigationProps): UseNavigationReturn => {
    // Estado del menú móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handlers del menú móvil (useCallback para estabilidad)
    const openMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(true);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    // Navegación basada en rol (memoizada para performance)
    const navigationItems = useMemo(() => {
        return getNavigationByRole(userRole);
    }, [userRole]);

    // Navegación pública (siempre disponible)
    const publicNavigationItems = useMemo(() => {
        return getNavigationByRole(); // Sin rol = navegación pública
    }, []);

    // Item activo basado en ruta actual
    const activeItem = useMemo(() => {
        return getActiveNavigationItem(currentPath, navigationItems);
    }, [currentPath, navigationItems]);

    // Verificar si la ruta actual está protegida
    const isCurrentPathProtected = useMemo(() => {
        return isProtectedRoute(currentPath);
    }, [currentPath]);

    // Helper para verificar si una ruta específica está activa
    const isActiveRoute = useCallback((path: string): boolean => {
        // Ruta exacta
        if (currentPath === path) return true;
        
        // Para rutas de dashboard, considerar paths que empiecen igual
        if (path.startsWith('/dashboard') && currentPath.startsWith(path)) {
            return true;
        }
        
        return false;
    }, [currentPath]);

    // Determinar si debemos mostrar navegación
    const shouldShowNavigation = useMemo(() => {
        // Si es una ruta protegida, necesita estar autenticado
        if (isCurrentPathProtected) {
            return !!userRole && Object.values(USER_ROLES).includes(userRole as any);
        }
        // Para rutas públicas, siempre mostrar navegación pública
        return true;
    }, [isCurrentPathProtected, userRole]);

    // Determinar si estamos en una ruta pública
    const isPublicRoute = useMemo(() => {
        return !isCurrentPathProtected;
    }, [isCurrentPathProtected]);

    return {
        // Navigation items
        navigationItems,
        publicNavigationItems,
        
        // Mobile menu state
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        toggleMobileMenu,
        
        // Active route state
        activeItem,
        isCurrentPathProtected,
        
        // Helpers
        isActiveRoute,
        shouldShowNavigation,
        isPublicRoute,
    };
};

// Hook especializado para obtener solo items de navegación por rol
export const useNavigationItems = (userRole?: string): NavigationItem[] => {
    return useMemo(() => {
        return getNavigationByRole(userRole);
    }, [userRole]);
};

// Hook para detectar si estamos en mobile (puede usarse en web y React Native)
export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(false);

    // En React Native, esto se implementaría diferente
    // Para web, usamos window.innerWidth
    const checkIsMobile = useCallback(() => {
        // Solo para web - en React Native esto se haría con Dimensions
        if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth < 768);
        }
    }, []);

    // En un entorno real, aquí pondríamos useEffect para detectar cambios
    // Por ahora es una implementación básica
    useMemo(() => {
        checkIsMobile();
    }, [checkIsMobile]);

    return isMobile;
};