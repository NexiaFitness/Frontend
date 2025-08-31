/**
 * Tipos TypeScript para sistema de autenticación
 * Define interfaces para usuarios, credenciales y respuestas API
 * Mantiene consistencia con backend FastAPI de Sosina
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { USER_ROLES } from "@shared/config/constants";

// User Role Types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// User Entity
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Authentication Credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

// API Response Types
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface LoginResponse extends AuthResponse { }

export interface RegisterResponse extends AuthResponse { }

// Auth State
export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Auth Actions
export interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    forgotPassword: (data: ForgotPasswordData) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    refreshAuth: () => Promise<void>;
}