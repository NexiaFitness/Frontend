/**
 * API de invitaciones de atletas (RTK Query).
 * Trainer: precheck, crear, listar, reenviar, cancelar.
 * Público: validate, accept (Fase 4 FE).
 */

import { baseApi } from "./baseApi";
import type {
    Invitation,
    InvitationAcceptRequest,
    InvitationAcceptResponse,
    InvitationCreate,
    InvitationListResponse,
    InvitationPrecheckResponse,
    InvitationValidateResponse,
} from "../types/invitation";

export interface ListInvitationsArg {
    status?: string;
    page?: number;
    page_size?: number;
}

export const invitationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        precheckInvitationEmail: builder.query<InvitationPrecheckResponse, string>({
            query: (email) => ({
                url: "/invitations/precheck",
                params: { email },
            }),
        }),

        sendInvitation: builder.mutation<Invitation, InvitationCreate>({
            query: (body) => ({
                url: "/invitations",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "Invitation", id: "LIST" },
                { type: "Client", id: "LIST_WITH_METRICS" },
            ],
        }),

        listInvitations: builder.query<InvitationListResponse, ListInvitationsArg | void>({
            query: (arg) => {
                const { status, page = 1, page_size = 50 } = arg ?? {};
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("page_size", String(page_size));
                if (status) {
                    params.set("status", status);
                }
                return `/invitations?${params.toString()}`;
            },
            providesTags: [{ type: "Invitation", id: "LIST" }],
        }),

        resendInvitation: builder.mutation<Invitation, number>({
            query: (invitationId) => ({
                url: `/invitations/${invitationId}/resend`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "Invitation", id: "LIST" }],
        }),

        cancelInvitation: builder.mutation<Invitation, number>({
            query: (invitationId) => ({
                url: `/invitations/${invitationId}/cancel`,
                method: "POST",
            }),
            invalidatesTags: [
                { type: "Invitation", id: "LIST" },
                { type: "Client", id: "LIST_WITH_METRICS" },
            ],
        }),

        validateInvitation: builder.query<InvitationValidateResponse, string>({
            query: (token) => ({
                url: "/invitations/validate",
                params: { token },
            }),
        }),

        acceptInvitation: builder.mutation<InvitationAcceptResponse, InvitationAcceptRequest>({
            query: (body) => ({
                url: "/invitations/accept",
                method: "POST",
                body,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    usePrecheckInvitationEmailQuery,
    useLazyPrecheckInvitationEmailQuery,
    useSendInvitationMutation,
    useListInvitationsQuery,
    useResendInvitationMutation,
    useCancelInvitationMutation,
    useValidateInvitationQuery,
    useLazyValidateInvitationQuery,
    useAcceptInvitationMutation,
} = invitationsApi;
