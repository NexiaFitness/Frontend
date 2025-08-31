/**
 * API de autenticación usando RTK Query
 * Define endpoints: login, register, forgotPassword, resetPassword, getCurrentUser
 * Genera hooks automáticos para el consumo en componentes React
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
        // Login
        login: builder.mutation<AuthResponse, LoginCredentials>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["Auth", "User"],
        }),

        // Registro
        register: builder.mutation<AuthResponse, RegisterCredentials>({
            query: (credentials) => ({
                url: "/auth/register",
                method: "POST",
                body: credentials,
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
