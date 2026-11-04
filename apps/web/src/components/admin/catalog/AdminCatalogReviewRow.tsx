/**
 * AdminCatalogReviewRow.tsx — Una fila de la revisión masiva.
 *
 * En móvil los desplegables ocupan el ancho de la card. El motivo del
 * desempate aparece al tocar el chip.
 */

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { Checkbox, FormCombobox } from "@/components/ui/forms";
import type { AdminCatalogExerciseListItemOut } from "@nexia/shared/types/adminCatalog";
import { AXIAL_OPTIONS, NIVEL_OPTIONS } from "./adminCatalogFieldOptions";
import {
    ADMIN_CATALOG_REVIEW_ACTIONS,
    ADMIN_CATALOG_REVIEW_CHIPS,
    ADMIN_CATALOG_REVIEW_COPY,
    ADMIN_CATALOG_REVIEW_FIELDS,
    ADMIN_CATALOG_REVIEW_META,
    ADMIN_CATALOG_REVIEW_NOTE,
    ADMIN_CATALOG_REVIEW_ROW,
    ADMIN_CATALOG_REVIEW_ROW_TOP,
    ADMIN_CATALOG_REVIEW_TITLE,
} from "./adminCatalogReviewPresentation";

interface AdminCatalogReviewRowProps {
    item: AdminCatalogExerciseListItemOut;
    selected: boolean;
    axialLoad: string;
    nivel: string;
    onToggle: () => void;
    onAxial: (value: string) => void;
    onNivel: (value: string) => void;
    onReview: () => void;
    onOpen: () => void;
}

function reviewChip(field: string, state: string | null | undefined) {
    if (state === "rubric") {
        return (
            <Badge variant="subtle">
                {field}: {ADMIN_CATALOG_REVIEW_COPY.rubricChip}
            </Badge>
        );
    }
    if (state === "pending_review") {
        return (
            <Badge variant="subtle-warning">
                {field}: {ADMIN_CATALOG_REVIEW_COPY.pendingChip}
            </Badge>
        );
    }
    return null;
}

export const AdminCatalogReviewRow: React.FC<AdminCatalogReviewRowProps> = ({
    item,
    selected,
    axialLoad,
    nivel,
    onToggle,
    onAxial,
    onNivel,
    onReview,
    onOpen,
}) => {
    const [noteOpen, setNoteOpen] = useState(false);
    const hasTiebreak = Boolean(item.axial_load_tiebreak || item.nivel_tiebreak);
    const meta = [item.primary_pattern, ...(item.equipment ?? [])].filter(Boolean).join(" · ");

    return (
        <article className={ADMIN_CATALOG_REVIEW_ROW} data-testid={`catalog-review-row-${item.exercise_pk}`}>
            <div className={ADMIN_CATALOG_REVIEW_ROW_TOP}>
                <Checkbox
                    checked={selected}
                    onChange={onToggle}
                    aria-label={ADMIN_CATALOG_REVIEW_COPY.selectLabel(item.nombre)}
                />
                <div className="min-w-0 flex-1 space-y-1">
                    <h2 className={ADMIN_CATALOG_REVIEW_TITLE}>{item.nombre}</h2>
                    {meta ? <p className={ADMIN_CATALOG_REVIEW_META}>{meta}</p> : null}
                </div>
            </div>
            <div className={ADMIN_CATALOG_REVIEW_CHIPS}>
                {reviewChip(ADMIN_CATALOG_REVIEW_COPY.fieldAxial, item.axial_load_review)}
                {reviewChip(ADMIN_CATALOG_REVIEW_COPY.fieldNivel, item.nivel_review)}
                {hasTiebreak ? (
                    <button
                        type="button"
                        aria-expanded={noteOpen}
                        onClick={() => setNoteOpen((open) => !open)}
                    >
                        <Badge variant="subtle-warning">{ADMIN_CATALOG_REVIEW_COPY.tiebreakChip}</Badge>
                    </button>
                ) : null}
            </div>
            {noteOpen && item.catalog_review_note ? (
                <p className={ADMIN_CATALOG_REVIEW_NOTE}>{item.catalog_review_note}</p>
            ) : null}
            <div className={ADMIN_CATALOG_REVIEW_FIELDS}>
                <FormCombobox
                    ariaLabel={ADMIN_CATALOG_REVIEW_COPY.axialLabel}
                    value={axialLoad}
                    options={AXIAL_OPTIONS}
                    onChange={onAxial}
                    variant="premium"
                    buttonClassName="w-full"
                />
                <FormCombobox
                    ariaLabel={ADMIN_CATALOG_REVIEW_COPY.nivelLabel}
                    value={nivel}
                    options={NIVEL_OPTIONS}
                    onChange={onNivel}
                    variant="premium"
                    buttonClassName="w-full"
                />
            </div>
            <div className={ADMIN_CATALOG_REVIEW_ACTIONS}>
                <Button type="button" variant="ghost-primary" size="sm" onClick={onReview}>
                    {ADMIN_CATALOG_REVIEW_COPY.reviewOne}
                </Button>
                <Button type="button" variant="ghost-primary" size="sm" onClick={onOpen}>
                    {ADMIN_CATALOG_REVIEW_COPY.openFicha}
                </Button>
            </div>
        </article>
    );
};
