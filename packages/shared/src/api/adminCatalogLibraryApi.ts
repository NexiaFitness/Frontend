/**
 * adminCatalogLibraryApi.ts — RTK Query de la biblioteca RepDB.
 *
 * Contrato verificado en el OpenAPI de la app (no en el servidor ya levantado):
 * - GET /admin/catalog/library/candidates
 * - GET /admin/catalog/library/candidates/{id}
 * - GET /admin/catalog/library/candidates/{id}/draft
 * - POST .../discard  { note }
 * - POST .../match    { exercise_pk }
 * - POST .../adopt    mismo cuerpo que POST /exercises/catalog
 */

import { baseApi } from "./baseApi";
import type {
    LibraryAdoptArgs,
    LibraryAdoptOut,
    LibraryCandidateDetailOut,
    LibraryCandidateListOut,
    LibraryCandidateListParams,
    LibraryCandidateOut,
    LibraryDraftOut,
} from "../types/adminCatalogLibrary";

export const adminCatalogLibraryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listLibraryCandidates: builder.query<
            LibraryCandidateListOut,
            LibraryCandidateListParams
        >({
            query: (params) => ({
                url: "/admin/catalog/library/candidates",
                method: "GET",
                params: {
                    skip: params.skip ?? 0,
                    limit: params.limit ?? 25,
                    ...(params.q ? { q: params.q } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    ...(params.scope ? { scope: params.scope } : {}),
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map((item) => ({
                              type: "LibraryCandidate" as const,
                              id: item.id,
                          })),
                          { type: "LibraryCandidate" as const, id: "LIST" },
                      ]
                    : [{ type: "LibraryCandidate" as const, id: "LIST" }],
        }),

        getLibraryCandidate: builder.query<LibraryCandidateDetailOut, number>({
            query: (candidateId) => ({
                url: `/admin/catalog/library/candidates/${candidateId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, candidateId) => [
                { type: "LibraryCandidate", id: candidateId },
            ],
        }),

        getLibraryCandidateDraft: builder.query<LibraryDraftOut, number>({
            query: (candidateId) => ({
                url: `/admin/catalog/library/candidates/${candidateId}/draft`,
                method: "GET",
            }),
            providesTags: (_result, _error, candidateId) => [
                { type: "LibraryCandidate", id: `DRAFT-${candidateId}` },
            ],
        }),

        discardLibraryCandidate: builder.mutation<
            LibraryCandidateOut,
            { candidateId: number; note: string }
        >({
            query: ({ candidateId, note }) => ({
                url: `/admin/catalog/library/candidates/${candidateId}/discard`,
                method: "POST",
                body: { note },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "LibraryCandidate", id: arg.candidateId },
                { type: "LibraryCandidate", id: "LIST" },
            ],
        }),

        matchLibraryCandidate: builder.mutation<
            LibraryCandidateOut,
            { candidateId: number; exercisePk: number }
        >({
            query: ({ candidateId, exercisePk }) => ({
                url: `/admin/catalog/library/candidates/${candidateId}/match`,
                method: "POST",
                body: { exercise_pk: exercisePk },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "LibraryCandidate", id: arg.candidateId },
                { type: "LibraryCandidate", id: "LIST" },
                { type: "AdminCatalog", id: arg.exercisePk },
            ],
        }),

        adoptLibraryCandidate: builder.mutation<LibraryAdoptOut, LibraryAdoptArgs>({
            query: ({ candidateId, body }) => ({
                url: `/admin/catalog/library/candidates/${candidateId}/adopt`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "LibraryCandidate", id: arg.candidateId },
                { type: "LibraryCandidate", id: "LIST" },
                { type: "AdminCatalog", id: "LIST" },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useListLibraryCandidatesQuery,
    useGetLibraryCandidateQuery,
    useGetLibraryCandidateDraftQuery,
    useDiscardLibraryCandidateMutation,
    useMatchLibraryCandidateMutation,
    useAdoptLibraryCandidateMutation,
} = adminCatalogLibraryApi;
