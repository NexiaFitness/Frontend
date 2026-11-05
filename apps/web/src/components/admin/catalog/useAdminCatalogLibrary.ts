/**
 * useAdminCatalogLibrary.ts — Lista y acciones de la biblioteca RepDB.
 *
 * La pantalla no escribe un candidato de tanda: el botón no se muestra y la
 * API también lo rechaza. Adoptar abre el alta normal con el id en la query.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListAdminCatalogExercisesQuery } from "@nexia/shared/api/adminCatalogApi";
import {
    useDiscardLibraryCandidateMutation,
    useListLibraryCandidatesQuery,
    useMatchLibraryCandidateMutation,
} from "@nexia/shared/api/adminCatalogLibraryApi";
import type { LibraryCandidateScope } from "@nexia/shared/types/adminCatalogLibrary";
import { useToast } from "@/components/ui/feedback";
import {
    LIBRARY_COPY,
    LIBRARY_DISCARD_MIN,
    libraryRefusalMessage,
} from "./adminCatalogLibraryPresentation";

const PAGE_SIZE = 25;

type ScopeFilter = "all" | LibraryCandidateScope;

interface ActionPanel {
    kind: "discard" | "match";
    id: number;
    name: string;
}

export function useAdminCatalogLibrary() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [scope, setScope] = useState<ScopeFilter>("all");
    const [page, setPage] = useState(1);
    const [panel, setPanel] = useState<ActionPanel | null>(null);
    const [discardNote, setDiscardNote] = useState("");
    const [matchQuery, setMatchQuery] = useState("");
    const [matchExercisePk, setMatchExercisePk] = useState<number | null>(null);

    useEffect(() => {
        const handle = window.setTimeout(() => setQuery(search.trim()), 300);
        return () => window.clearTimeout(handle);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [query, scope]);

    const list = useListLibraryCandidatesQuery({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        q: query || undefined,
        scope: scope === "all" ? undefined : scope,
    });

    const exercises = useListAdminCatalogExercisesQuery(
        { search: matchQuery.trim(), skip: 0, limit: 8 },
        { skip: panel?.kind !== "match" || matchQuery.trim().length < 2 }
    );

    const [discardCandidate, discardState] = useDiscardLibraryCandidateMutation();
    const [matchCandidate, matchState] = useMatchLibraryCandidateMutation();

    const closePanel = () => {
        setPanel(null);
        setDiscardNote("");
        setMatchQuery("");
        setMatchExercisePk(null);
    };

    const openDiscard = (id: number, name: string) => {
        setPanel({ kind: "discard", id, name });
        setDiscardNote("");
    };

    const openMatch = (id: number, name: string) => {
        setPanel({ kind: "match", id, name });
        setMatchQuery("");
        setMatchExercisePk(null);
    };

    const confirmDiscard = async () => {
        if (panel?.kind !== "discard") return;
        if (discardNote.trim().length < LIBRARY_DISCARD_MIN) return;
        try {
            await discardCandidate({ candidateId: panel.id, note: discardNote.trim() }).unwrap();
            showSuccess(LIBRARY_COPY.discardedToast);
            closePanel();
        } catch (error) {
            showError(libraryRefusalMessage(error) ?? LIBRARY_COPY.saveError);
        }
    };

    const confirmMatch = async () => {
        if (panel?.kind !== "match" || matchExercisePk == null) return;
        try {
            await matchCandidate({
                candidateId: panel.id,
                exercisePk: matchExercisePk,
            }).unwrap();
            showSuccess(LIBRARY_COPY.matchedToast);
            closePanel();
        } catch (error) {
            showError(libraryRefusalMessage(error) ?? LIBRARY_COPY.saveError);
        }
    };

    const adopt = (id: number) => {
        navigate(`/dashboard/admin/catalog/new?libraryCandidate=${id}`);
    };

    const total = list.data?.total ?? 0;

    return {
        search,
        setSearch,
        scope,
        setScope,
        page,
        setPage,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        items: list.data?.items ?? [],
        total,
        batchCount: list.data?.batch_count ?? 0,
        libraryCount: list.data?.library_count ?? 0,
        versionedRefs: list.data?.versioned_batch_refs ?? 0,
        isLoading: list.isLoading,
        isError: list.isError,
        refetch: list.refetch,
        panel,
        discardNote,
        setDiscardNote,
        discardReady: discardNote.trim().length >= LIBRARY_DISCARD_MIN,
        matchQuery,
        setMatchQuery,
        matchExercisePk,
        setMatchExercisePk,
        exerciseChoices: exercises.data?.items ?? [],
        isSaving: discardState.isLoading || matchState.isLoading,
        openDiscard,
        openMatch,
        closePanel,
        confirmDiscard,
        confirmMatch,
        adopt,
        goToCatalog: () => navigate("/dashboard/admin/catalog"),
    };
}
