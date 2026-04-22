/**
 * RTK Query — Fase B: POST /session-load/validate-draft (proyección borrador).
 */

import { baseApi } from "./baseApi";
import type {
    SessionLoadDraftValidateIn,
    SessionLoadDraftValidateOut,
} from "../types/sessionLoad";

export const sessionLoadApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        validateSessionLoadDraft: builder.mutation<
            SessionLoadDraftValidateOut,
            SessionLoadDraftValidateIn
        >({
            query: (body) => ({
                url: "/session-load/validate-draft",
                method: "POST",
                body,
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useValidateSessionLoadDraftMutation } = sessionLoadApi;
