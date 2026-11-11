/**
 * AdminCatalogPreviewPanel.tsx — «Cómo cuenta»: lo que hará el motor con el borrador, sin guardar.
 *
 * Contexto: H5 (POST /admin/catalog/preview, con retardo en useAdminCatalogPreview). H10:
 * es el contenido de la tarjeta de la columna derecha; una fila por grupo muscular con
 * nombre y rol, barra y número, y debajo la carga axial y si entra al programar.
 * Notas de mantenimiento: solo pinta; el cálculo es del servidor.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Check, TriangleAlert } from "lucide-react";
import { formatCatalogMultiplier } from "@nexia/shared";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import type { AdminCatalogPreviewState } from "./useAdminCatalogPreview";
import {
    ADMIN_CATALOG_PREVIEW_COPY as COPY,
    ADMIN_CATALOG_PREVIEW_SKELETON,
    axialScaleName,
    catalogPreviewSelectorCopy,
} from "./adminCatalogPreviewPresentation";
import {
    COUNT_COPY,
    FICHA_COUNT_LABEL,
    FICHA_COUNT_LIST,
    FICHA_COUNT_NAME,
    FICHA_COUNT_ROLE,
    FICHA_COUNT_ROW,
    FICHA_COUNT_VALUE,
    FICHA_DIVIDER,
    FICHA_EMPTY,
    FICHA_FACT_OK,
    FICHA_FACT_TERM,
    FICHA_FACT_VALUE,
    FICHA_FACT_VALUE_MUTED,
    FICHA_FACT_WARN,
    FICHA_FACTS,
    FICHA_NOTE,
} from "./adminCatalogFichaPresentation";

const SKELETON_ROWS = [0, 1, 2];

function barPercent(multiplier: string): number {
    const value = Number(multiplier);
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value * 100));
}

export const AdminCatalogPreviewPanel: React.FC<{ preview: AdminCatalogPreviewState }> = ({ preview }) => {
    const data = preview.data;

    if (!preview.ready) {
        return <p className={FICHA_EMPTY}>{COPY.incomplete}</p>;
    }
    if (preview.showSkeleton) {
        return (
            <div className={FICHA_COUNT_LIST} aria-busy data-testid="catalog-preview">
                <p className={FICHA_NOTE}>{COPY.calculating}</p>
                {SKELETON_ROWS.map((row) => (
                    <div key={row} className={ADMIN_CATALOG_PREVIEW_SKELETON} />
                ))}
            </div>
        );
    }
    if (preview.isError || !data) {
        return (
            <Alert
                variant="error"
                action={
                    <Button type="button" variant="ghost-primary" size="sm" onClick={preview.retry}>
                        {COPY.retry}
                    </Button>
                }
            >
                {COPY.error}
            </Alert>
        );
    }

    const selectable = data.selector_blocks.length === 0;
    const axial = data.axial_weight;
    return (
        <div className={FICHA_COUNT_LIST} data-testid="catalog-preview">
            {data.validation_errors.length > 0 ? (
                <ul className={FICHA_NOTE}>
                    {data.validation_errors.map((message, index) => (
                        <li key={`${index}-${message}`}>{message}</li>
                    ))}
                </ul>
            ) : null}
            {data.volume_per_set.empty_reason === "not_strength" ? (
                <p className={FICHA_EMPTY}>{COPY.notStrength}</p>
            ) : (
                <ul className={FICHA_COUNT_LIST}>
                    {data.volume_per_set.groups.map((group) => (
                        <li key={group.muscle_group_id} className={FICHA_COUNT_ROW}>
                            <span className={FICHA_COUNT_LABEL}>
                                <span className={FICHA_COUNT_NAME}>{group.name}</span>
                                <span className={FICHA_COUNT_ROLE}>{COPY.role[group.role]}</span>
                            </span>
                            <AthleteProgressBar tone="primary" value={barPercent(group.multiplier)} aria-label={group.name} />
                            <span className={FICHA_COUNT_VALUE}>{formatCatalogMultiplier(group.multiplier)}</span>
                        </li>
                    ))}
                </ul>
            )}
            {data.volume_per_set.is_plyometric ? <p className={FICHA_NOTE}>{COPY.productCriterion}</p> : null}
            <div className={FICHA_DIVIDER} aria-hidden />
            <dl className={FICHA_FACTS}>
                <dt className={FICHA_FACT_TERM}>{COUNT_COPY.axial}</dt>
                <dd className={FICHA_FACT_VALUE}>
                    {axial.verifiable && axial.weight != null ? (
                        <>
                            {axialScaleName(axial.weight)}{" "}
                            <span className={FICHA_FACT_VALUE_MUTED}>· {COUNT_COPY.axialWeight(axial.weight)}</span>
                        </>
                    ) : (
                        COPY.notVerifiable
                    )}
                </dd>
                <dt className={FICHA_FACT_TERM}>{COUNT_COPY.sessions}</dt>
                <dd className={selectable ? FICHA_FACT_OK : FICHA_FACT_WARN}>
                    {selectable ? <Check aria-hidden /> : <TriangleAlert aria-hidden />}
                    {catalogPreviewSelectorCopy(data.selector_blocks)}
                </dd>
            </dl>
            {axial.reason === "axial_pending_review" ? <p className={FICHA_NOTE}>{COPY.pendingAxial}</p> : null}
        </div>
    );
};
