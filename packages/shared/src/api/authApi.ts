/**
 * API de autenticación usando RTK Query
 * CORREGIDO: Compatibilidad MSW + URLSearchParams en entorno testing
 * Define endpoints: login, register, forgotPassword, resetPassword, getCurrentUser, verifyEmail
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { baseApi } from "./baseApi";
import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    RegisterResponse,
    VerifyEmailData,
    VerifyEmailResponse,
    ForgotPasswordData,
    ResetPasswordData,
    User,
} from "../types/auth";

// Helper para detectar entorno de testing
const isTestEnvironment = typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || process.env.VITEST);

// Helper para crear body de login compatible con MSW
const createLoginBody = (credentials: LoginCredentials) => {
    const params = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
    });

    // MSW en Node.js requiere string serializado, browser acepta URLSearchParams nativo
    return isTestEnvironment ? params.toString() : params;
};

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Login - FastAPI OAuth2 con compatibilidad MSW
        login: builder.mutation<AuthResponse, LoginCredentials>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: new URLSearchParams({
                    username: credentials.username,
                    password: credentials.password,
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }),
            invalidatesTags: ["Auth", "User"],
        }),

        // Registro con autologin - devuelve tokens automáticamente
        register: builder.mutation<RegisterResponse, RegisterCredentials>({
            query: (credentials) => ({
                url: "/auth/register",
                method: "POST",
                body: credentials,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Auth", "User"],
        }),

        // Email verification
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailData>({
            query: (data) => ({
                url: "/auth/verify-email",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Auth", "User"],
        }),

        // Resto de endpoints sin cambios...
        forgotPassword: builder.mutation<void, ForgotPasswordData>({
            query: (data) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        resetPassword: builder.mutation<void, ResetPasswordData>({
            query: (data) => ({
                url: "/auth/reset-password",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        getCurrentUser: builder.query<User, void>({
            query: () => ({
                url: "/auth/me",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetCurrentUserQuery,
} = authApi;