/**
 * AdminCatalogTechniqueSection.tsx — Contenido de la tarjeta «Técnica» de la ficha admin.
 *
 * Contexto: SPEC_H10 y DISENO_H10_FICHA_ADMIN §3. Tres columnas en escritorio: Descripción
 * (área de texto con contador), Ejecución (un campo por paso, numerado) y Consejos (uno por
 * campo, opcionales). «Vista previa» pinta el texto con ExerciseTechniqueText, lo mismo
 * que ve el entrenador. El segmentado (AdminCatalogTechniqueViews) va en la cabecera de la
 * tarjeta en escritorio y dentro de ella en móvil.
 * Notas de mantenimiento: solo pinta; normalización, límites y errores en shared
 * (catalogTechnique). Al adoptar desde la Biblioteca la técnica es opcional.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { LineListInput, Textarea } from "@/components/ui/forms";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
import { ExerciseTechniqueText } from "@/components/exercises/ExerciseTechniqueText";
import {
    CATALOG_TECHNIQUE_LIMITS,
    isTechniqueEmpty,
    splitPastedLines,
    techniqueFromDraft,
    type CatalogTechniqueDraft,
    type CatalogTechniqueFieldErrors,
    type CatalogTechniqueMode,
} from "@nexia/shared";
import {
    ADMIN_CATALOG_TECHNIQUE_COPY as COPY,
    ADMIN_CATALOG_TECHNIQUE_COUNTER,
    ADMIN_CATALOG_TECHNIQUE_COUNTER_OVER,
    ADMIN_CATALOG_TECHNIQUE_DESCRIPTION_INPUT,
    ADMIN_CATALOG_TECHNIQUE_GRID,
    ADMIN_CATALOG_TECHNIQUE_HINT,
    ADMIN_CATALOG_TECHNIQUE_OPTIONAL,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW,
    ADMIN_CATALOG_TECHNIQUE_PREVIEW_EMPTY,
    type AdminCatalogTechniqueView,
} from "./adminCatalogTechniquePresentation";

export const AdminCatalogTechniqueViews: React.FC<{
    view: AdminCatalogTechniqueView;
    onChange: (view: AdminCatalogTechniqueView) => void;
    className?: string;
}> = ({ view, onChange, className }) => (
    <TabsBar
        className={className}
        items={COPY.views.map((item) => ({ id: item.id, label: item.label }))}
        value={view}
        onChange={(id) => onChange(id === "preview" ? "preview" : "write")}
        ariaLabel={COPY.viewsAriaLabel}
        distribute="equal"
    />
);

export interface AdminCatalogTechniqueSectionProps {
    mode: CatalogTechniqueMode;
    view: AdminCatalogTechniqueView;
    technique: CatalogTechniqueDraft;
    errors: CatalogTechniqueFieldErrors;
    onChange: (patch: Partial<CatalogTechniqueDraft>) => void;
}

export const AdminCatalogTechniqueSection: React.FC<AdminCatalogTechniqueSectionProps> = ({
    mode,
    view,
    technique,
    errors,
    onChange,
}) => {
    const normalized = useMemo(() => techniqueFromDraft(technique), [technique]);
    const required = mode !== "adopt";

    if (view === "preview") {
        return isTechniqueEmpty(normalized) ? (
            <p className={ADMIN_CATALOG_TECHNIQUE_PREVIEW_EMPTY}>
                {mode === "edit" ? COPY.previewEmptyEdit : COPY.previewEmptyCreate}
            </p>
        ) : (
            <div className={ADMIN_CATALOG_TECHNIQUE_PREVIEW}>
                <ExerciseTechniqueText
                    description={normalized.description}
                    steps={normalized.steps}
                    tips={normalized.tips}
                    headingLevel="h3"
                />
            </div>
        );
    }

    const over = normalized.description.length > CATALOG_TECHNIQUE_LIMITS.descriptionMax;
    return (
        <>
            {mode === "adopt" ? <p className={ADMIN_CATALOG_TECHNIQUE_HINT}>{COPY.libraryHint}</p> : null}
            <div className={ADMIN_CATALOG_TECHNIQUE_GRID}>
                <div>
                    <Textarea
                        id="cat-tecnica-descripcion"
                        variant="premium"
                        label={COPY.descriptionLabel}
                        isRequired={required}
                        rows={4}
                        className={ADMIN_CATALOG_TECHNIQUE_DESCRIPTION_INPUT}
                        placeholder={COPY.descriptionPlaceholder}
                        value={technique.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        error={errors.description ?? undefined}
                        aria-invalid={errors.description ? true : undefined}
                    />
                    <p className={cn(ADMIN_CATALOG_TECHNIQUE_COUNTER, over && ADMIN_CATALOG_TECHNIQUE_COUNTER_OVER)}>
                        {COPY.descriptionCounter(normalized.description.length)}
                    </p>
                </div>
                <LineListInput
                    id="cat-tecnica-ejecucion"
                    label={
                        <>
                            {COPY.stepsLabel}
                            {required ? " *" : null}
                        </>
                    }
                    items={technique.steps}
                    onChange={(steps) => onChange({ steps })}
                    marker="number"
                    itemLabel={COPY.stepItem}
                    placeholder={COPY.stepPlaceholder}
                    addLabel={COPY.addStep}
                    maxItems={CATALOG_TECHNIQUE_LIMITS.stepsMax}
                    minItems={1}
                    splitPaste={splitPastedLines}
                    helperText={COPY.stepsHelper(normalized.steps.length)}
                    error={errors.steps}
                />
                <LineListInput
                    id="cat-tecnica-consejos"
                    label={
                        <>
                            {COPY.tipsLabel} <span className={ADMIN_CATALOG_TECHNIQUE_OPTIONAL}>{COPY.tipsOptional}</span>
                        </>
                    }
                    items={technique.tips}
                    onChange={(tips) => onChange({ tips })}
                    marker="bullet"
                    itemLabel={COPY.tipItem}
                    placeholder={COPY.tipPlaceholder}
                    addLabel={COPY.addTip}
                    maxItems={CATALOG_TECHNIQUE_LIMITS.tipsMax}
                    splitPaste={splitPastedLines}
                    helperText={COPY.tipsHelper(normalized.tips.length)}
                    error={errors.tips}
                />
            </div>
        </>
    );
};
