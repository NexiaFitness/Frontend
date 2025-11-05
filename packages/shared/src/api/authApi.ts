/**
 * API de autenticación usando RTK Query
 * CORREGIDO: Compatibilidad MSW + URLSearchParams en entorno testing
 * Define endpoints: login, register, forgotPassword, resetPassword, getCurrentUser, verifyEmail, resendVerification
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.5.2 - Agregado resendVerification endpoint
 */

import { baseApi } from "./baseApi";
import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    RegisterResponse,
    VerifyEmailData,
    VerifyEmailResponse,
    ResendVerificationData,
    ResendVerificationResponse,
    ForgotPasswordData,
    ResetPasswordData,
    LogoutRequest,
    LogoutResponse,
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
                body: createLoginBody(credentials),
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

        // ✅ NUEVO - Resend verification email
        resendVerification: builder.mutation<ResendVerificationResponse, ResendVerificationData>({
            query: (data) => ({
                url: "/auth/resend-verification",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
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

        // Logout - revoca refresh token en el backend
        logout: builder.mutation<LogoutResponse, LogoutRequest>({
            query: (data) => ({
                url: "/auth/logout",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Auth", "User"],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
} = authApi;