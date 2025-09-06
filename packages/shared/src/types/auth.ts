/**
 * Tipos TypeScript para sistema de autenticación
 * Define interfaces para usuarios, credenciales y respuestas API
 * CORREGIDO: Alineado con backend FastAPI de Sosina
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { USER_ROLES } from "@shared/config/constants";

// User Role Types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// User Entity (CORREGIDO para coincidir con respuesta real del backend)
export interface User {
    id: number;
    email: string;
    nombre: string;     // Backend usa español, no first_name
    apellidos: string;  // Backend usa español, no last_name
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

// Authentication Credentials (CORREGIDO según backend real)
export interface LoginCredentials {
    username: string;    // Backend espera username, no email
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    nombre: string;      // Backend usa español
    apellidos: string;   // Backend usa español
    role: UserRole;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;    // Simplificado, mantenemos consistencia
}

// API Response Types - CORREGIDO según respuesta real del backend
export interface AuthResponse {
    access_token: string;
    token_type: string;      // Siempre "bearer"
    expires_in: number;      // Segundos hasta expiración (1800 = 30 min)
    user: User;
}

export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {}

// Auth State - para Redux slice
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Auth Actions - para Redux slice  
export interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    forgotPassword: (data: ForgotPasswordData) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    clearError: () => void;
}