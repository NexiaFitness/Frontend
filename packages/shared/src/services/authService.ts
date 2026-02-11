/**
 * Servicio de autenticación unificado
 * Maneja login, registro con autologin y gestión de tokens
 * Compatible con React Web y React Native
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { store } from "../store";
import { loginSuccess, loginFailure, logout } from "../store/authSlice";
import { API_CONFIG, AUTH_CONFIG } from "../config/constants";
import type { 
    LoginCredentials, 
    RegisterCredentials, 
    AuthResponse,
    User 
} from "../types/auth";

// Storage abstraction para compatibilidad web/RN
const getStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage; // Web
    }
    // React Native - AsyncStorage se importaría aquí
    return {
        getItem: (key: string) => null,
        setItem: (key: string, value: string) => {},
        removeItem: (key: string) => {}
    };
};

const storage = getStorage();

/**
 * Servicio de autenticación con autologin
 * Centraliza toda la lógica de auth para reutilización
 */
export class AuthService {
    private static instance: AuthService;
    
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Login tradicional
     * @param credentials - Credenciales de login
     * @returns Promise<AuthResponse>
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({
                    username: credentials.username,
                    password: credentials.password,
                }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const authData: AuthResponse = await response.json();
            this.handleAuthSuccess(authData);
            return authData;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Registro con autologin automático
     * @param userData - Datos de registro
     * @returns Promise<AuthResponse>
     */
    async register(userData: RegisterCredentials): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const authData: AuthResponse = await response.json();
            this.handleAuthSuccess(authData);
            return authData;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Logout con limpieza completa
     */
    async logout(): Promise<void> {
        try {
            // Limpiar storage (usar claves unificadas de AUTH_CONFIG)
            storage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            storage.removeItem(AUTH_CONFIG.REFRESH_KEY);

            // Dispatch logout action
            store.dispatch(logout());
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    /**
     * Maneja el éxito de autenticación (login/register)
     * @param authData - Datos de autenticación
     */
    private handleAuthSuccess(authData: AuthResponse): void {
        // Guardar tokens en storage (claves unificadas de AUTH_CONFIG)
        storage.setItem(AUTH_CONFIG.TOKEN_KEY, authData.access_token);
        if (authData.refresh_token) {
            storage.setItem(AUTH_CONFIG.REFRESH_KEY, authData.refresh_token);
        }

        // Dispatch success action
        store.dispatch(loginSuccess({
            user: authData.user,
            token: authData.access_token,
            refreshToken: authData.refresh_token,
        }));
    }

    /**
     * Maneja errores de autenticación
     * @param error - Error ocurrido
     */
    private handleAuthError(error: any): void {
        store.dispatch(loginFailure(error.message || 'Authentication failed'));
    }

    /**
     * Obtiene el token actual
     * @returns string | null
     */
    getCurrentToken(): string | null {
        return storage.getItem(AUTH_CONFIG.TOKEN_KEY);
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns boolean
     */
    isAuthenticated(): boolean {
        return !!this.getCurrentToken();
    }

    /**
     * Obtiene el usuario actual del store
     * @returns User | null
     */
    getCurrentUser(): User | null {
        const state = store.getState();
        return state.auth.user;
    }
}

// Instancia singleton
export const authService = AuthService.getInstance();