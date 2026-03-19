/**
 * Constantes globales de la aplicación NEXIA
 * Centraliza URLs, configuraciones y valores estáticos
 * Facilita mantenimiento y evita magic strings en el código
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { API_BASE_URL } from './env';

// API Configuration
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
} as const;

// Authentication
export const AUTH_CONFIG = {
    TOKEN_KEY: 'nexia_token',
    REFRESH_KEY: 'nexia_refresh',
    USER_KEY: 'nexia_user',
    TOKEN_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    TRAINER: 'trainer',
    ATHLETE: 'athlete',
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    DASHBOARD: '/dashboard',
    CLIENTS: '/clients',
    TRAINING: '/training',
    PROFILE: '/profile',
} as const;

// Application Metadata
export const APP_INFO = {
    NAME: 'NEXIA Fitness Platform',
    VERSION: '1.0.0',
    DESCRIPTION: 'Professional fitness training management platform',
} as const;

/**
 * Máximo de registros por petición en GET /exercises/?limit=...
 * Debe coincidir con el backend (FastAPI Query le=1000 en app/api/exercises.py).
 */
export const EXERCISES_LIST_MAX_LIMIT = 1000;
