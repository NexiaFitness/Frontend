/**
 * AdminCatalogPreviewPanel.tsx — Cómo contará el motor el borrador de la ficha.
 *
 * No guarda. El retardo está en useAdminCatalogPreview.
 */

import React from "react";
import { formatCatalogVolumePerSet } from "@nexia/shared";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import type { AdminCatalogPreviewState } from "./useAdminCatalogPreview";
import {
    ADMIN_CATALOG_PREVIEW_CARD,
    ADMIN_CATALOG_PREVIEW_COPY,
    ADMIN_CATALOG_PREVIEW_LINE,
    ADMIN_CATALOG_PREVIEW_META,
    ADMIN_CATALOG_PREVIEW_NOTE,
    ADMIN_CATALOG_PREVIEW_ROW,
    ADMIN_CATALOG_PREVIEW_SKELETON,
    ADMIN_CATALOG_PREVIEW_TITLE,
} from "./adminCatalogPreviewPresentation";

const SKELETON_ROWS = [0, 1, 2];

function barPercent(multiplier: string): number {
    const value = Number(multiplier);
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value * 100));
}

export const AdminCatalogPreviewPanel: React.FC<{ preview: AdminCatalogPreviewState }> = ({
    preview,
}) => {
    const data = preview.data;
    const sentence = data ? formatCatalogVolumePerSet(data.volume_per_set.groups) : "";

    return (
        <section className={ADMIN_CATALOG_PREVIEW_CARD} aria-busy={preview.showSkeleton} data-testid="catalog-preview">
            <NexiaGlassAccentRim />
            <h2 className={ADMIN_CATALOG_PREVIEW_TITLE}>{ADMIN_CATALOG_PREVIEW_COPY.title}</h2>

            {!preview.ready ? (
                <p className={ADMIN_CATALOG_PREVIEW_META}>{ADMIN_CATALOG_PREVIEW_COPY.incomplete}</p>
            ) : null}

            {preview.ready && preview.showSkeleton ? (
                <div>
                    {SKELETON_ROWS.map((row) => (
                        <div key={row} className={ADMIN_CATALOG_PREVIEW_SKELETON} />
                    ))}
                </div>
            ) : null}

            {preview.ready && preview.isError ? (
                <Alert
                    variant="error"
                    action={
                        <Button type="button" variant="ghost-primary" size="sm" onClick={preview.retry}>
                            {ADMIN_CATALOG_PREVIEW_COPY.retry}
                        </Button>
                    }
                >
                    {ADMIN_CATALOG_PREVIEW_COPY.error}
                </Alert>
            ) : null}

            {preview.ready && data && !preview.showSkeleton ? (
                <div className="space-y-3">
                    {data.validation_errors.length > 0 ? (
                        <ul className={ADMIN_CATALOG_PREVIEW_META}>
                            {data.validation_errors.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    ) : null}

                    {data.volume_per_set.empty_reason === "not_strength" ? (
                        <p className={ADMIN_CATALOG_PREVIEW_LINE}>{ADMIN_CATALOG_PREVIEW_COPY.notStrength}</p>
                    ) : (
                        <p className={ADMIN_CATALOG_PREVIEW_LINE}>{sentence}</p>
                    )}

                    {data.volume_per_set.is_plyometric ? (
                        <p className={ADMIN_CATALOG_PREVIEW_NOTE}>{ADMIN_CATALOG_PREVIEW_COPY.productCriterion}</p>
                    ) : null}

                    {data.volume_per_set.groups.map((group) => (
                        <div key={group.muscle_group_id} className={ADMIN_CATALOG_PREVIEW_ROW}>
                            <p className={ADMIN_CATALOG_PREVIEW_LINE}>
                                {group.name}
                                <span className={ADMIN_CATALOG_PREVIEW_META}>
                                    {` · ${ADMIN_CATALOG_PREVIEW_COPY.role[group.role]} ${group.multiplier}`}
                                </span>
                            </p>
                            <AthleteProgressBar
                                tone="primary"
                                value={barPercent(group.multiplier)}
                                aria-label={group.name}
                            />
                        </div>
                    ))}

                    <p className={ADMIN_CATALOG_PREVIEW_LINE}>
                        {data.axial_weight.verifiable && data.axial_weight.weight != null
                            ? ADMIN_CATALOG_PREVIEW_COPY.axial(data.axial_weight.weight)
                            : ADMIN_CATALOG_PREVIEW_COPY.notVerifiable}
                    </p>
                    {data.axial_weight.reason === "axial_pending_review" ? (
                        <p className={ADMIN_CATALOG_PREVIEW_NOTE}>{ADMIN_CATALOG_PREVIEW_COPY.pendingAxial}</p>
                    ) : null}
                    <p className={ADMIN_CATALOG_PREVIEW_META}>
                        {data.selectable_in_sessions
                            ? ADMIN_CATALOG_PREVIEW_COPY.selectable
                            : ADMIN_CATALOG_PREVIEW_COPY.notSelectable}
                    </p>
                </div>
            ) : null}
        </section>
    );
};
