/**
 * AdminCatalogCoreSection.tsx — Contenido de la tarjeta «Datos» de la ficha admin.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §2). Nombre e inglés a todo el ancho; objetivo de
 * entrenamiento, tipo, nivel, lateralidad y carga axial en dos columnas. Cada error va bajo
 * su campo (validateCatalogBundleDraft.byField). Las propuestas de nivel y carga axial
 * (rúbrica o pendiente) se confirman con un interruptor, sin cambiar el valor (H1 R4).
 * Notas de mantenimiento: solo pinta; el borrador vive en useAdminExerciseCatalogForm.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { FormCombobox, FormField, Input, NexiaSwitch } from "@/components/ui/forms";
import { NEXIA_FORM_CONTROL_ERROR } from "@/components/ui/forms/formControlPresentation";
import {
    parseCatalogAxialLoad,
    parseTrainingObjective,
    type CatalogCoreDraft,
    type CatalogCoreFieldId,
} from "@nexia/shared";
import {
    AXIAL_OPTIONS,
    AXIAL_PENDING_CONFIRM,
    AXIAL_PLACEHOLDER,
    LATERALITY_OPTIONS,
    NIVEL_OPTIONS,
    NIVEL_PENDING_CONFIRM,
    NIVEL_PLACEHOLDER,
    OBJETIVO_HINT,
    OBJETIVO_OPTIONS,
    OBJETIVO_PLACEHOLDER,
    PENDING_REVIEW_HINT,
    RUBRIC_CONFIRM_HINT,
    TIPO_OPTIONS,
} from "./adminCatalogFieldOptions";
import type { CatalogProposalKind, PendingReviewState } from "./adminCatalogFormTypes";
import {
    DATOS_COPY,
    FICHA_FIELD_GRID,
    FICHA_FIELD_LEAD,
    FICHA_FIELD_NOTE,
    FICHA_FIELD_ROW,
    FICHA_NAME_GRID,
} from "./adminCatalogFichaPresentation";

interface AdminCatalogCoreSectionProps {
    core: CatalogCoreDraft;
    errors: Partial<Record<CatalogCoreFieldId, string>>;
    pendingReview: PendingReviewState;
    onCoreChange: (patch: Partial<CatalogCoreDraft>) => void;
}

const FIELD = "premium" as const;

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? (
        <p id={id} className={NEXIA_FORM_CONTROL_ERROR}>
            {message}
        </p>
    ) : null;
}

function Proposal({
    id,
    kind,
    label,
    checked,
    onChange,
}: {
    id: string;
    kind: CatalogProposalKind | null;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    if (!kind) return null;
    return (
        <>
            <p className={FICHA_FIELD_NOTE}>{kind === "pending_review" ? PENDING_REVIEW_HINT : RUBRIC_CONFIRM_HINT}</p>
            <NexiaSwitch id={id} label={label} checked={checked} onChange={onChange} />
        </>
    );
}

export const AdminCatalogCoreSection: React.FC<AdminCatalogCoreSectionProps> = ({
    core,
    errors,
    pendingReview,
    onCoreChange,
}) => (
    <>
        <div className={FICHA_NAME_GRID}>
        <FormField label={DATOS_COPY.nombre} htmlFor="cat-nombre" required variant={FIELD}>
            <Input
                id="cat-nombre"
                variant={FIELD}
                value={core.nombre}
                placeholder={DATOS_COPY.nombrePlaceholder}
                error={errors.nombre}
                aria-invalid={errors.nombre ? true : undefined}
                onChange={(e) => onCoreChange({ nombre: e.target.value })}
            />
        </FormField>
        <FormField label={DATOS_COPY.nombreIngles} htmlFor="cat-nombre-en" variant={FIELD}>
            <Input
                id="cat-nombre-en"
                variant={FIELD}
                value={core.nombre_ingles ?? ""}
                placeholder={DATOS_COPY.nombreInglesPlaceholder}
                onChange={(e) => onCoreChange({ nombre_ingles: e.target.value || null })}
            />
        </FormField>
        </div>
        <div className={FICHA_FIELD_GRID}>
            <FormField label={DATOS_COPY.objetivo} htmlFor="cat-objetivo" required variant={FIELD} className={FICHA_FIELD_LEAD}>
                <FormCombobox
                    id="cat-objetivo"
                    variant={FIELD}
                    value={core.objetivo_entrenamiento ?? ""}
                    options={OBJETIVO_OPTIONS}
                    placeholder={OBJETIVO_PLACEHOLDER}
                    invalid={Boolean(errors.objetivo_entrenamiento)}
                    describedBy="cat-objetivo-error"
                    onChange={(value) => onCoreChange({ objetivo_entrenamiento: parseTrainingObjective(value) })}
                />
                <FieldError id="cat-objetivo-error" message={errors.objetivo_entrenamiento} />
            </FormField>
            <FormField label={DATOS_COPY.tipo} htmlFor="cat-tipo" required variant={FIELD}>
                <FormCombobox
                    id="cat-tipo"
                    variant={FIELD}
                    value={core.tipo}
                    options={TIPO_OPTIONS}
                    invalid={Boolean(errors.tipo)}
                    describedBy="cat-tipo-error"
                    onChange={(value) => onCoreChange({ tipo: value })}
                />
                <FieldError id="cat-tipo-error" message={errors.tipo} />
            </FormField>
            <FormField label={DATOS_COPY.lateralidad} htmlFor="cat-lat" variant={FIELD}>
                <FormCombobox
                    id="cat-lat"
                    variant={FIELD}
                    value={core.laterality ?? "bilateral"}
                    options={LATERALITY_OPTIONS}
                    invalid={Boolean(errors.laterality)}
                    describedBy="cat-lat-error"
                    onChange={(value) => onCoreChange({ laterality: value })}
                />
                <FieldError id="cat-lat-error" message={errors.laterality} />
            </FormField>
            <FormField label={DATOS_COPY.nivel} htmlFor="cat-nivel" required variant={FIELD}>
                <FormCombobox
                    id="cat-nivel"
                    variant={FIELD}
                    value={core.nivel}
                    options={NIVEL_OPTIONS}
                    placeholder={NIVEL_PLACEHOLDER}
                    invalid={Boolean(errors.nivel)}
                    describedBy="cat-nivel-error"
                    onChange={(value) => onCoreChange({ nivel: value })}
                />
                <FieldError id="cat-nivel-error" message={errors.nivel} />
            </FormField>
            <FormField label={DATOS_COPY.cargaAxial} htmlFor="cat-axial" required variant={FIELD}>
                <FormCombobox
                    id="cat-axial"
                    variant={FIELD}
                    value={core.axial_load ?? ""}
                    options={AXIAL_OPTIONS}
                    placeholder={AXIAL_PLACEHOLDER}
                    invalid={Boolean(errors.axial_load)}
                    describedBy="cat-axial-error"
                    onChange={(value) => onCoreChange({ axial_load: parseCatalogAxialLoad(value) })}
                />
                <FieldError id="cat-axial-error" message={errors.axial_load} />
            </FormField>
            {pendingReview.nivel || pendingReview.axial_load ? (
            <div className={FICHA_FIELD_ROW}>
                <Proposal
                    id="cat-nivel-review"
                    kind={pendingReview.nivel}
                    label={NIVEL_PENDING_CONFIRM}
                    checked={core.nivel_review === "reviewed"}
                    onChange={(checked) => onCoreChange({ nivel_review: checked ? "reviewed" : null })}
                />
                <Proposal
                    id="cat-axial-review"
                    kind={pendingReview.axial_load}
                    label={AXIAL_PENDING_CONFIRM}
                    checked={core.axial_load_review === "reviewed"}
                    onChange={(checked) => onCoreChange({ axial_load_review: checked ? "reviewed" : null })}
                />
            </div>
            ) : null}
        </div>
        <p className={FICHA_FIELD_NOTE}>{OBJETIVO_HINT}</p>
    </>
);
