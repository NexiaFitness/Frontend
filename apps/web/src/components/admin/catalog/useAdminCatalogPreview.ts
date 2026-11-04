/**
 * useAdminCatalogPreview.ts — Vista previa de la ficha, 400 ms después de editar.
 *
 * El retardo y la llamada viven aquí. El texto lo arma formatCatalogVolumePerSet.
 */

import { useEffect, useState } from "react";
import { usePreviewAdminCatalogMutation } from "@nexia/shared/api/adminCatalogApi";
import type { CatalogPreviewOut, ExerciseCatalogBundleCreateIn } from "@nexia/shared/types/adminCatalog";
import { toBundleDraft } from "./useAdminExerciseCatalogForm";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";

const PREVIEW_DELAY_MS = 400;

export function catalogPreviewReady(draft: AdminCatalogFormDraft): boolean {
    const core = draft.core;
    return Boolean(
        core.nombre.trim() &&
            core.tipo.trim() &&
            core.nivel.trim() &&
            core.axial_load &&
            core.objetivo_entrenamiento
    );
}

export interface AdminCatalogPreviewState {
    ready: boolean;
    data: CatalogPreviewOut | undefined;
    isError: boolean;
    showSkeleton: boolean;
    retry: () => void;
}

export function useAdminCatalogPreview(draft: AdminCatalogFormDraft): AdminCatalogPreviewState {
    const [trigger, result] = usePreviewAdminCatalogMutation();
    const ready = catalogPreviewReady(draft);
    const serialized = ready ? JSON.stringify(toBundleDraft(draft)) : "";
    const [body, setBody] = useState<ExerciseCatalogBundleCreateIn | null>(null);

    useEffect(() => {
        if (!serialized) {
            setBody(null);
            return;
        }
        const handle = window.setTimeout(() => {
            const parsed = JSON.parse(serialized) as ExerciseCatalogBundleCreateIn;
            setBody(parsed);
            void trigger(parsed);
        }, PREVIEW_DELAY_MS);
        return () => window.clearTimeout(handle);
    }, [serialized, trigger]);

    const retry = () => {
        if (body) void trigger(body);
    };

    return {
        ready,
        data: result.data,
        isError: result.isError,
        showSkeleton: ready && result.data === undefined && !result.isError,
        retry,
    };
}
