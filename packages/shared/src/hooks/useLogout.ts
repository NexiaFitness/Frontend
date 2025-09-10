/**
 * Hook personalizado para logout profesional
 * Centraliza toda la lógica de logout con manejo profesional de estados
 * Reutilizable en Admin, Trainer, Athlete dashboards
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { ROUTES } from '../config/constants';
import type { AppDispatch, RootState } from '../store';

interface UseLogoutOptions {
    redirectTo?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    confirmationRequired?: boolean;
}

interface UseLogoutReturn {
    logout: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    user: any;
}

export const useLogout = (options: UseLogoutOptions = {}): UseLogoutReturn => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

    const {
        redirectTo = ROUTES.LOGIN,
        onSuccess,
        onError,
    } = options;

    const handleLogout = async (): Promise<void> => {
        try {
            // Ejecutar async thunk de logout profesional
            await dispatch(logout()).unwrap();

            // Callback de éxito si se proporciona
            onSuccess?.();

            // Navegación automática tras logout exitoso
            navigate(redirectTo, { replace: true });
            
        } catch (logoutError) {
            const errorMessage = typeof logoutError === 'string' 
                ? logoutError 
                : 'Error durante el logout';

            // Callback de error si se proporciona
            onError?.(errorMessage);

            // Log del error para debugging
            console.warn('Logout completed with warnings:', logoutError);

            // Navegar de todas formas por seguridad
            navigate(redirectTo, { replace: true });
        }
    };

    return {
        logout: handleLogout,
        isLoading,
        error,
        user,
    };
};