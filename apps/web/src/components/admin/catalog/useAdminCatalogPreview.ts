/**
 * useAdminCatalogPreview.ts — Vista previa de la ficha, 400 ms después de editar.
 *
 * El resultado queda ligado al borrador que lo produjo. Una respuesta tardía
 * no pinta las barras de una versión anterior.
 */

import { useEffect, useRef, useState } from "react";
import { usePreviewAdminCatalogMutation } from "@nexia/shared/api/adminCatalogApi";
import type { CatalogPreviewOut, ExerciseCatalogBundleCreateIn } from "@nexia/shared/types/adminCatalog";
import { toBundleDraft } from "./adminCatalogDraft";
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

interface SettledPreview {
    key: string;
    data: CatalogPreviewOut;
}

export function useAdminCatalogPreview(draft: AdminCatalogFormDraft): AdminCatalogPreviewState {
    const [trigger] = usePreviewAdminCatalogMutation();
    const ready = catalogPreviewReady(draft);
    const serialized = ready ? JSON.stringify(toBundleDraft(draft)) : "";
    const [body, setBody] = useState<ExerciseCatalogBundleCreateIn | null>(null);
    const [settled, setSettled] = useState<SettledPreview | null>(null);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const requestSeq = useRef(0);

    useEffect(() => {
        const id = ++requestSeq.current;
        if (!serialized) {
            setBody(null);
            return;
        }
        const handle = window.setTimeout(() => {
            const parsed = JSON.parse(serialized) as ExerciseCatalogBundleCreateIn;
            setBody(parsed);
            void trigger(parsed)
                .unwrap()
                .then((data) => {
                    if (requestSeq.current !== id) return;
                    setSettled({ key: serialized, data });
                    setErrorKey(null);
                })
                .catch(() => {
                    if (requestSeq.current !== id) return;
                    setErrorKey(serialized);
                });
        }, PREVIEW_DELAY_MS);
        return () => window.clearTimeout(handle);
    }, [serialized, trigger]);

    const retry = () => {
        if (!serialized || !body) return;
        const id = ++requestSeq.current;
        const key = serialized;
        setErrorKey(null);
        void trigger(body)
            .unwrap()
            .then((data) => {
                if (requestSeq.current !== id) return;
                setSettled({ key, data });
                setErrorKey(null);
            })
            .catch(() => {
                if (requestSeq.current !== id) return;
                setErrorKey(key);
            });
    };

    const failed = serialized !== "" && errorKey === serialized;
    const current = !failed && settled?.key === serialized ? settled.data : undefined;

    return {
        ready,
        data: current,
        isError: ready && failed,
        showSkeleton: ready && !current && !failed,
        retry,
    };
}
