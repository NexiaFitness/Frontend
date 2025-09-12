/**
 * Hook para obtener el rol del usuario actual desde el store de Redux
 * Conecta la navegación con el estado de autenticación de manera limpia
 * Reutilizable entre web y React Native
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { useSelector } from 'react-redux';
import { selectUser, selectAuth, selectIsAuthenticated } from '../store/authSlice';
import { User, UserRole } from '../types/auth';
import { USER_ROLES } from '../config/constants';

export interface UseUserRoleReturn {
    userRole: UserRole | null;
    user: User | null;
    isAuthenticated: boolean;
    isTrainer: boolean;
    isAdmin: boolean;
    isAthlete: boolean;
    hasRole: (role: UserRole) => boolean;
}

/**
 * Hook principal para obtener información del rol del usuario
 */
export const useUserRole = (): UseUserRoleReturn => {
    // Selectores de Redux
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    
    // Extraer rol del usuario (con fallback seguro)
    const userRole = user?.role || null;
    
    // Helpers de verificación de roles
    const isTrainer = userRole === USER_ROLES.TRAINER;
    const isAdmin = userRole === USER_ROLES.ADMIN;
    const isAthlete = userRole === USER_ROLES.ATHLETE;
    
    // Helper genérico para verificar cualquier rol
    const hasRole = (role: UserRole): boolean => {
        return userRole === role;
    };

    return {
        userRole,
        user,
        isAuthenticated,
        isTrainer,
        isAdmin,
        isAthlete,
        hasRole,
    };
};

/**
 * Hook simplificado para obtener solo el rol como string
 */
export const useCurrentUserRole = (): string | null => {
    const user = useSelector(selectUser);
    return user?.role || null;
};

/**
 * Hook para verificar si el usuario tiene permisos para una acción específica
 */
export const useUserPermissions = () => {
    const { userRole, isAuthenticated } = useUserRole();
    
    const canManageClients = isAuthenticated && (userRole === USER_ROLES.TRAINER || userRole === USER_ROLES.ADMIN);
    const canAccessAdminPanel = isAuthenticated && userRole === USER_ROLES.ADMIN;
    const canCreatePlans = isAuthenticated && (userRole === USER_ROLES.TRAINER || userRole === USER_ROLES.ADMIN);
    const canViewOwnData = isAuthenticated; // Todos los usuarios autenticados
    
    return {
        canManageClients,
        canAccessAdminPanel,
        canCreatePlans,
        canViewOwnData,
        userRole,
        isAuthenticated,
    };
};