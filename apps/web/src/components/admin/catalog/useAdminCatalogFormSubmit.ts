/**
 * useAdminCatalogFormSubmit.ts — Atajos de guardado, historial y uso al desactivar.
 *
 * Contexto: extraído de AdminExerciseCatalogForm (H5, SPEC §2.6). El guardado
 * en sí sigue en useAdminExerciseCatalogForm.
 * Notas: Ctrl/Cmd+S guarda; Ctrl/Cmd+Enter marca revisado y sigue. El historial
 * exige un ejercicio ya guardado. El uso solo se pide con el modal de baja abierto.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import { useCallback, useEffect } from "react";
import { useGetCatalogExerciseUsageQuery } from "@nexia/shared/api/adminCatalogApi";

interface UseAdminCatalogFormSubmitArgs {
    exercisePk: number | null;
    currentPk: number | null;
    deactivateOpen: boolean;
    handleSave: () => Promise<void>;
    handleReviewedAndNext: () => Promise<void>;
    setHistoryOpen: (open: boolean) => void;
    showError: (message: string) => void;
}

export function useAdminCatalogFormSubmit({
    exercisePk,
    currentPk,
    deactivateOpen,
    handleSave,
    handleReviewedAndNext,
    setHistoryOpen,
    showError,
}: UseAdminCatalogFormSubmitArgs) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                void handleSave();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                void handleReviewedAndNext();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleReviewedAndNext, handleSave]);

    const { data: usage, isFetching: usageLoading } = useGetCatalogExerciseUsageQuery(
        exercisePk ?? 0,
        { skip: exercisePk == null || !deactivateOpen }
    );

    const openHistory = useCallback(() => {
        if (currentPk == null) {
            showError("Guarda el ejercicio para ver el historial");
            return;
        }
        setHistoryOpen(true);
    }, [currentPk, setHistoryOpen, showError]);

    return { usage, usageLoading, openHistory };
}
