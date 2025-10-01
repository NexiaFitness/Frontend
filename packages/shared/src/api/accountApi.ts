/**
 * API de gestión de cuenta del usuario usando RTK Query (sobre baseApi).
 * Endpoints cubiertos: updateAccount (PUT /auth/me), changePassword (POST /auth/change-password),
 * y deleteAccount (DELETE /auth/me). Esta capa es puramente de datos (sin dependencias de UI),
 * por lo que es válida para web y mobile.
 * 
 * Decisiones:
 * - No importo acciones del authSlice aquí para evitar acoplamiento. La UI (o un thunk) debe
 *   encargarse de sincronizar authSlice.user tras update o de hacer logout tras delete.
 * - Invalidación de tags: invalido "User" (y "Auth" en delete) para forzar refetch donde proceda.
 * 
 * Uso esperado en UI:
 * - updateAccount: al resolver, actualizar el estado local (dispatch setCurrentUser(user)).
 * - changePassword: mostrar feedback de éxito/error sin tocar estado global.
 * - deleteAccount: al resolver, disparar logout() y redirigir a landing o register.
 * 
 * @author Nelson
 * @since v1.0.0
 */

import { baseApi } from "./baseApi";
import type { User } from "../types/auth";
import type {
    UpdateAccountPayload,
    ChangePasswordPayload,
} from "../types/account";

export const accountApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Actualizar cuenta - devuelve User directo
        updateAccount: builder.mutation<User, UpdateAccountPayload>({
            query: (data) => ({
                url: "/auth/me",
                method: "PUT",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: ["User"],
        }),

        // Cambiar contraseña - devuelve mensaje de confirmación
        changePassword: builder.mutation<{ message: string }, ChangePasswordPayload>({
            query: (data) => ({
                url: "/auth/change-password",
                method: "POST",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
        }),

        // Eliminar cuenta - devuelve mensaje de confirmación
        deleteAccount: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: "/auth/me",
                method: "DELETE",
            }),
            invalidatesTags: ["User", "Auth"],
        }),
    }),
    overrideExisting: false,
});

// Hooks generados
export const {
    useUpdateAccountMutation,
    useChangePasswordMutation,
    useDeleteAccountMutation,
} = accountApi;