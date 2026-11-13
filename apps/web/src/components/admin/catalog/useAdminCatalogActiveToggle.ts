/**
 * useAdminCatalogActiveToggle.ts — Desactivar y reactivar un ejercicio desde su ficha.
 *
 * Contexto: extraído de useAdminExerciseCatalogForm (H10, límite de tamaño). Ambas acciones
 * se confirman en un NexiaPremiumConfirmModal y piden guardar antes si hay cambios, porque
 * no van en el bundle: son su propia llamada (DELETE /exercises/{pk} y reactivar).
 * Notas de mantenimiento: la respuesta de desactivar trae la ficha completa (con
 * updated_at); reactivar no, así que rehidrata con un GET para no romper el bloqueo optimista.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { useCallback, useState } from "react";
import {
    useDeactivateCatalogExerciseMutation,
    useReactivateCatalogExerciseMutation,
} from "@nexia/shared/api/adminCatalogApi";
import type { CatalogExerciseOut } from "@nexia/shared/types/adminCatalog";
import { useToast } from "@/components/ui/feedback";
import { ADMIN_CATALOG_COPY } from "./adminCatalogPresentation";

interface UseAdminCatalogActiveToggleArgs {
    exercisePk: number | null;
    isDirty: boolean;
    applyCatalog: (catalog: CatalogExerciseOut) => void;
    reload: () => Promise<void>;
}

export function useAdminCatalogActiveToggle({
    exercisePk,
    isDirty,
    applyCatalog,
    reload,
}: UseAdminCatalogActiveToggleArgs) {
    const { showSuccess, showError } = useToast();
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [reactivateOpen, setReactivateOpen] = useState(false);
    const [deactivateCatalog, { isLoading: isDeactivating }] = useDeactivateCatalogExerciseMutation();
    const [reactivateCatalog, { isLoading: isReactivating }] = useReactivateCatalogExerciseMutation();

    const refuseIfDirty = useCallback(
        (close: (open: boolean) => void) => {
            if (!isDirty) return false;
            showError(ADMIN_CATALOG_COPY.saveBeforeToggleActive);
            close(false);
            return true;
        },
        [isDirty, showError]
    );

    const handleDeactivate = useCallback(async () => {
        if (exercisePk == null || refuseIfDirty(setDeactivateOpen)) return;
        try {
            applyCatalog(await deactivateCatalog(exercisePk).unwrap());
            showSuccess(ADMIN_CATALOG_COPY.deactivatedToast);
        } catch {
            showError(ADMIN_CATALOG_COPY.deactivateError);
        } finally {
            setDeactivateOpen(false);
        }
    }, [applyCatalog, deactivateCatalog, exercisePk, refuseIfDirty, showError, showSuccess]);

    const handleReactivate = useCallback(async () => {
        if (exercisePk == null || refuseIfDirty(setReactivateOpen)) return;
        try {
            await reactivateCatalog(exercisePk).unwrap();
            await reload();
            showSuccess(ADMIN_CATALOG_COPY.reactivatedToast);
        } catch {
            showError(ADMIN_CATALOG_COPY.reactivateError);
        } finally {
            setReactivateOpen(false);
        }
    }, [exercisePk, reactivateCatalog, refuseIfDirty, reload, showError, showSuccess]);

    return {
        deactivateOpen,
        setDeactivateOpen,
        reactivateOpen,
        setReactivateOpen,
        handleDeactivate,
        handleReactivate,
        isTogglingActive: isDeactivating || isReactivating,
    };
}
