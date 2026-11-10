/**
 * AdminCatalogTechniqueSection.tsx — Pestaña «Técnica» de la ficha admin: escribir y ver.
 *
 * Contexto: SPEC_H10 §6.4. Tres campos (descripción, ejecución con un paso por línea y
 * consejos opcionales) y, al lado, la vista previa con ExerciseTechniqueText, el mismo
 * componente de la ficha del entrenador. Solo render: el borrador vive en
 * useAdminExerciseCatalogForm; normalización, contadores y límites en shared
 * (catalogTechnique). Lo obligatorio se avisa al guardar, en los errores de la sección.
 * Notas de mantenimiento: copy y clases en adminCatalogTechniquePresentation.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
import { ExerciseTechniqueText } from "@/components/exercises/ExerciseTechniqueText";
import {
    isTechniqueEmpty,
    techniqueCounts,
    techniqueFieldErrors,
    techniqueFromDraft,
    type CatalogTechniqueDraft,
} from "@nexia/shared";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_SECTION_TITLE,
} from "./adminCatalogPresentation";
import {
    ADMIN_CATALOG_TECHNIQUE_COLUMN_HIDDEN,
    ADMIN_CATALOG_TECHNIQUE_COPY as COPY,
    ADMIN_CATALOG_TECHNIQUE_DESCRIPTION_INPUT,
    ADMIN_CATALOG_TECHNIQUE_EDITOR,
    ADMIN_CATALOG_TECHNIQUE_LAYOUT,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW_EMPTY,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW_HEADER,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW_HINT,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW_TITLE,
    ADMIN_CATALOG_TECHNIQUE_STEPS_INPUT,
    ADMIN_CATALOG_TECHNIQUE_TIPS_INPUT,
    ADMIN_CATALOG_TECHNIQUE_VIEWS,
    type AdminCatalogTechniqueView,
} from "./adminCatalogTechniquePresentation";

export interface AdminCatalogTechniqueSectionProps {
    className: string;
    mode: "create" | "edit";
    technique: CatalogTechniqueDraft;
    errors: string[];
    onTechniqueChange: (patch: Partial<CatalogTechniqueDraft>) => void;
}

const FIELD = "premium" as const;

export const AdminCatalogTechniqueSection: React.FC<AdminCatalogTechniqueSectionProps> = ({
    className,
    mode,
    technique,
    errors,
    onTechniqueChange,
}) => {
    const [view, setView] = useState<AdminCatalogTechniqueView>("write");
    const normalized = useMemo(() => techniqueFromDraft(technique), [technique]);
    const counts = techniqueCounts(normalized);
    const fieldErrors = techniqueFieldErrors(normalized);
    const isEmpty = isTechniqueEmpty(normalized);

    return (
        <section id="tecnica" className={className} aria-labelledby="tecnica-title">
            <div>
                <h2 id="tecnica-title" className={ADMIN_CATALOG_SECTION_TITLE}>
                    {COPY.title}
                </h2>
                <p className={ADMIN_CATALOG_SECTION_HINT}>{COPY.hint}</p>
            </div>
            {errors.map((message) => (
                <Alert key={message} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                    {message}
                </Alert>
            ))}

            <TabsBar
                className={ADMIN_CATALOG_TECHNIQUE_VIEWS}
                items={COPY.views.map((item) => ({ id: item.id, label: item.label }))}
                value={view}
                onChange={(id) => setView(id === "preview" ? "preview" : "write")}
                ariaLabel={COPY.viewsAriaLabel}
                distribute="equal"
            />

            <div className={ADMIN_CATALOG_TECHNIQUE_LAYOUT}>
                <div
                    className={cn(
                        ADMIN_CATALOG_TECHNIQUE_EDITOR,
                        view !== "write" && ADMIN_CATALOG_TECHNIQUE_COLUMN_HIDDEN
                    )}
                >
                    <Textarea
                        id="cat-tecnica-descripcion"
                        variant={FIELD}
                        label={COPY.descriptionLabel}
                        isRequired
                        rows={3}
                        className={ADMIN_CATALOG_TECHNIQUE_DESCRIPTION_INPUT}
                        placeholder={COPY.descriptionPlaceholder}
                        value={technique.description}
                        onChange={(e) => onTechniqueChange({ description: e.target.value })}
                        helperText={COPY.descriptionHelper(counts)}
                        error={fieldErrors.description ?? undefined}
                        aria-invalid={fieldErrors.description ? true : undefined}
                    />
                    <Textarea
                        id="cat-tecnica-ejecucion"
                        variant={FIELD}
                        label={COPY.stepsLabel}
                        isRequired
                        rows={6}
                        className={ADMIN_CATALOG_TECHNIQUE_STEPS_INPUT}
                        placeholder={COPY.stepsPlaceholder}
                        value={technique.stepsText}
                        onChange={(e) => onTechniqueChange({ stepsText: e.target.value })}
                        helperText={COPY.stepsHelper(counts)}
                        error={fieldErrors.steps ?? undefined}
                        aria-invalid={fieldErrors.steps ? true : undefined}
                    />
                    <Textarea
                        id="cat-tecnica-consejos"
                        variant={FIELD}
                        label={COPY.tipsLabel}
                        rows={3}
                        className={ADMIN_CATALOG_TECHNIQUE_TIPS_INPUT}
                        placeholder={COPY.tipsPlaceholder}
                        value={technique.tipsText}
                        onChange={(e) => onTechniqueChange({ tipsText: e.target.value })}
                        helperText={COPY.tipsHelper(counts)}
                        error={fieldErrors.tips ?? undefined}
                        aria-invalid={fieldErrors.tips ? true : undefined}
                    />
                </div>

                <aside
                    className={cn(
                        ADMIN_CATALOG_TECHNIQUE_PREVIEW,
                        view !== "preview" && ADMIN_CATALOG_TECHNIQUE_COLUMN_HIDDEN
                    )}
                    aria-labelledby="tecnica-preview-title"
                >
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_CATALOG_TECHNIQUE_PREVIEW_HEADER}>
                        <h3 id="tecnica-preview-title" className={ADMIN_CATALOG_TECHNIQUE_PREVIEW_TITLE}>
                            {COPY.previewTitle}
                        </h3>
                        <p className={ADMIN_CATALOG_TECHNIQUE_PREVIEW_HINT}>{COPY.previewHint}</p>
                    </div>
                    {isEmpty ? (
                        <p className={ADMIN_CATALOG_TECHNIQUE_PREVIEW_EMPTY}>
                            {mode === "create" ? COPY.previewEmptyCreate : COPY.previewEmptyEdit}
                        </p>
                    ) : (
                        <ExerciseTechniqueText
                            description={normalized.description}
                            steps={normalized.steps}
                            tips={normalized.tips}
                            headingLevel="h4"
                        />
                    )}
                </aside>
            </div>
        </section>
    );
};
