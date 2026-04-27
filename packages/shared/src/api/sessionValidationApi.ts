/**
 * sessionValidationApi.ts — RTK Query para validación automática de sesiones
 *
 * Contexto:
 * - Fase 7 de SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 * - Endpoint: POST /session-validation/validate-session
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 7 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

import { baseApi } from "./baseApi";
import type { SessionValidationOut } from "../types/sessionValidation";

export const sessionValidationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /** Validar una sesión contra su bloque de periodización (patrones + volumen V1). */
        validateSession: builder.mutation<
            SessionValidationOut,
            { trainingSessionId: number }
        >({
            query: ({ trainingSessionId }) => ({
                url: "/session-validation/validate-session",
                method: "POST",
                body: { training_session_id: trainingSessionId },
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useValidateSessionMutation } = sessionValidationApi;
