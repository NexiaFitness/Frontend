/**
 * Tipos TypeScript para sistema de autenticación
 * Alineados con schemas reales del backend FastAPI verificados.
 * Campos opcionales según implementación real del backend.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { USER_ROLES } from "@shared/config/constants";

// User Role Types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// User Entity
export interface User {
    id: number;
    email: string;
    nombre: string;
    apellidos: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

// Authentication Credentials
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    role: UserRole;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    new_password: string;
}

export interface RegisterResponse {
    message: string;
    verification_token?: string; // Solo presente en development
}

export interface VerifyEmailData {
    token: string;
}

export interface VerifyEmailResponse {
    message: string;
    email: string;
}

// API Response Types
export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
    refresh_token?: string; // Opcional según backend real
}

export interface LoginResponse extends AuthResponse {}


export interface ForgotPasswordResponse {
    message: string;
    reset_token?: string; // Opcional - solo en development
}

export interface ApiErrorResponse {
    detail: string;
    status_code?: number; // Opcional - backend real no lo envía
}

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