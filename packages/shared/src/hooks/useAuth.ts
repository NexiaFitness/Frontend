/**
 * Hook de autenticación unificado
 * Proporciona métodos de login, registro con autologin y gestión de estado
 * Compatible con React Web y React Native
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import type { RootState } from '../store';
import type { 
    LoginCredentials, 
    RegisterCredentials, 
    AuthResponse 
} from '../types/auth';

/**
 * Hook de autenticación con autologin
 * @returns Objeto con métodos de auth y estado
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    
    // Estado del store
    const { user, token, isAuthenticated, isLoading, error } = useSelector(
        (state: RootState) => state.auth
    );

    /**
     * Login tradicional
     * @param credentials - Credenciales de login
     * @returns Promise<AuthResponse>
     */
    const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const authData = await authService.login(credentials);
            return authData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, []);

    /**
     * Registro con autologin automático
     * @param userData - Datos de registro
     * @returns Promise<AuthResponse>
     */
    const register = useCallback(async (userData: RegisterCredentials): Promise<AuthResponse> => {
        try {
            const authData = await authService.register(userData);
            return authData;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }, []);

    /**
     * Logout con limpieza completa
     */
    const logout = useCallback(async (): Promise<void> => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }, []);

    /**
     * Obtiene la ruta de redirección según el rol del usuario
     * @param role - Rol del usuario
     * @returns string - Ruta de redirección
     */
    const getRedirectPath = (role: string): string => {
        switch (role) {
            case 'TRAINER':
                return '/dashboard/trainer';
            case 'ATHLETE':
                return '/dashboard/athlete';
            case 'ADMIN':
                return '/dashboard/admin';
            default:
                return '/dashboard';
        }
    };

    /**
     * Verifica si el usuario tiene un rol específico
     * @param role - Rol a verificar
     * @returns boolean
     */
    const hasRole = useCallback((role: string): boolean => {
        return user?.role === role;
    }, [user]);

    /**
     * Verifica si el usuario es trainer
     * @returns boolean
     */
    const isTrainer = useCallback((): boolean => {
        return hasRole('TRAINER');
    }, [hasRole]);

    /**
     * Verifica si el usuario es athlete
     * @returns boolean
     */
    const isAthlete = useCallback((): boolean => {
        return hasRole('ATHLETE');
    }, [hasRole]);

    /**
     * Verifica si el usuario es admin
     * @returns boolean
     */
    const isAdmin = useCallback((): boolean => {
        return hasRole('ADMIN');
    }, [hasRole]);

    return {
        // Estado
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        
        // Métodos
        login,
        register,
        logout,
        
        // Utilidades
        hasRole,
        isTrainer,
        isAthlete,
        isAdmin,
        getRedirectPath,
    };
};