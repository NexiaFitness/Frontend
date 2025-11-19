/**
 * Hook personalizado para logout profesional
 * Centraliza toda la lógica de logout con manejo profesional de estados
 * Reutilizable en Admin, Trainer, Athlete dashboards
 * Cross-platform compatible - no depende de react-router-dom
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { baseApi } from '../api/baseApi';
import type { AppDispatch, RootState } from '../store';
import type { User } from '../types/auth'; 

interface UseLogoutOptions {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onNavigate?: (path: string) => void;
}

interface UseLogoutReturn {
    logout: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    user: User | null; 
}

export const useLogout = (options: UseLogoutOptions = {}): UseLogoutReturn => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

    const {
        onSuccess,
        onError,
        onNavigate,
    } = options;

    const handleLogout = async (): Promise<void> => {
        try {
            // ✅ CRÍTICO: Cancelar queries ANTES de disparar logout
            // Esto previene que queries se ejecuten durante la transición
            dispatch(baseApi.util.resetApiState());
            
            // Ejecutar async thunk de logout profesional
            const result = dispatch(logout());
            
            // Verificar que el resultado tenga unwrap (thunk action)
            if (result && typeof result.unwrap === 'function') {
                await result.unwrap();
            } else {
                // Si no tiene unwrap, esperar directamente la promesa
                await result;
            }

            // Callback de éxito si se proporciona
            onSuccess?.();

            // Navegación delegada a la aplicación que usa el hook
            onNavigate?.('/auth/login');
            
        } catch (logoutError) {
            const errorMessage = typeof logoutError === 'string' 
                ? logoutError 
                : 'Error durante el logout';

            // Callback de error si se proporciona
            onError?.(errorMessage);

            // Log del error para debugging
            console.warn('Logout completed with warnings:', logoutError);

            // Navegar de todas formas por seguridad
            onNavigate?.('/auth/login');
        }
    };

    return {
        logout: handleLogout,
        isLoading,
        error,
        user,
    };
};