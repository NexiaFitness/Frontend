/**
 * API de autenticación usando RTK Query
 * CORREGIDO: Formato form-urlencoded para login según backend FastAPI OAuth2
 * Define endpoints: login, register, forgotPassword, resetPassword, getCurrentUser
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { baseApi } from "./baseApi";
import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    ForgotPasswordData,
    ResetPasswordData,
    User,
} from "../types/auth";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Login - FastAPI OAuth2 requiere form-urlencoded
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

        // Registro - JSON format normal
        register: builder.mutation<AuthResponse, RegisterCredentials>({
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

        // Forgot Password
        forgotPassword: builder.mutation<void, ForgotPasswordData>({
            query: (data) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: data,
            }),
        }),

        // Reset Password
        resetPassword: builder.mutation<void, ResetPasswordData>({
            query: (data) => ({
                url: "/auth/reset-password",
                method: "POST",
                body: data,
            }),
        }),

        // Obtener usuario actual
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
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetCurrentUserQuery,
} = authApi;