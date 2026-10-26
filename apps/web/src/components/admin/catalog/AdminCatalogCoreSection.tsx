/**
 * AdminCatalogCoreSection.tsx — Sección «Datos» de la ficha Admin (núcleo del ejercicio).
 *
 * Contexto: extraída de AdminExerciseCatalogForm (H1, regla de tamaño) al añadir el objetivo
 * de entrenamiento. Solo render: el estado y la validación viven en useAdminExerciseCatalogForm
 * y en validateCatalogBundleDraft (shared).
 * Notas de mantenimiento: carga axial, nivel y objetivo empiezan vacíos y son obligatorios; una
 * propuesta pendiente de revisión solo pasa a revisada si el administrador la confirma.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, FormCombobox, FormField, Input, Textarea } from "@/components/ui/forms";
import { parseCatalogAxialLoad, parseTrainingObjective, type CatalogCoreDraft } from "@nexia/shared";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_SECTION_TITLE,
} from "./adminCatalogPresentation";
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
    TIPO_OPTIONS,
} from "./adminCatalogFieldOptions";
import type { PendingReviewState } from "./adminCatalogFormTypes";

interface AdminCatalogCoreSectionProps {
    className: string;
    core: CatalogCoreDraft;
    errors: string[];
    pendingReview: PendingReviewState;
    onCoreChange: (patch: Partial<CatalogCoreDraft>) => void;
}

const FIELD = "premium" as const;

export const AdminCatalogCoreSection: React.FC<AdminCatalogCoreSectionProps> = ({
    className,
    core,
    errors,
    pendingReview,
    onCoreChange,
}) => (
    <section id="datos" className={className}>
        <h2 className={ADMIN_CATALOG_SECTION_TITLE}>{ADMIN_CATALOG_COPY.sectionDatos}</h2>
        {errors.map((msg) => (
            <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                {msg}
            </Alert>
        ))}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombre" htmlFor="cat-nombre" required variant={FIELD}>
                <Input
                    id="cat-nombre"
                    variant={FIELD}
                    value={core.nombre}
                    onChange={(e) => onCoreChange({ nombre: e.target.value })}
                />
            </FormField>
            <FormField label="Nombre EN" htmlFor="cat-nombre-en" variant={FIELD}>
                <Input
                    id="cat-nombre-en"
                    variant={FIELD}
                    value={core.nombre_ingles ?? ""}
                    onChange={(e) => onCoreChange({ nombre_ingles: e.target.value || null })}
                />
            </FormField>
            <FormField label="Objetivo de entrenamiento" htmlFor="cat-objetivo" required variant={FIELD}>
                <FormCombobox
                    id="cat-objetivo"
                    variant={FIELD}
                    value={core.objetivo_entrenamiento ?? ""}
                    options={OBJETIVO_OPTIONS}
                    placeholder={OBJETIVO_PLACEHOLDER}
                    onChange={(value) =>
                        onCoreChange({ objetivo_entrenamiento: parseTrainingObjective(value) })
                    }
                />
                <p className={ADMIN_CATALOG_SECTION_HINT}>{OBJETIVO_HINT}</p>
            </FormField>
            <FormField label="Tipo" htmlFor="cat-tipo" required variant={FIELD}>
                <FormCombobox
                    id="cat-tipo"
                    variant={FIELD}
                    value={core.tipo}
                    options={TIPO_OPTIONS}
                    onChange={(value) => onCoreChange({ tipo: value })}
                />
            </FormField>
            <FormField label="Nivel" htmlFor="cat-nivel" required variant={FIELD}>
                <FormCombobox
                    id="cat-nivel"
                    variant={FIELD}
                    value={core.nivel}
                    options={NIVEL_OPTIONS}
                    placeholder={NIVEL_PLACEHOLDER}
                    onChange={(value) => onCoreChange({ nivel: value })}
                />
                {pendingReview.nivel ? (
                    <Checkbox
                        id="cat-nivel-review"
                        label={NIVEL_PENDING_CONFIRM}
                        checked={core.nivel_review === "reviewed"}
                        onChange={(e) =>
                            onCoreChange({ nivel_review: e.target.checked ? "reviewed" : null })
                        }
                    />
                ) : null}
            </FormField>
            <FormField label="Lateralidad" htmlFor="cat-lat" variant={FIELD}>
                <FormCombobox
                    id="cat-lat"
                    variant={FIELD}
                    value={core.laterality ?? "bilateral"}
                    options={LATERALITY_OPTIONS}
                    onChange={(value) => onCoreChange({ laterality: value })}
                />
            </FormField>
            <FormField label="Carga axial" htmlFor="cat-axial" required variant={FIELD}>
                <FormCombobox
                    id="cat-axial"
                    variant={FIELD}
                    value={core.axial_load ?? ""}
                    options={AXIAL_OPTIONS}
                    placeholder={AXIAL_PLACEHOLDER}
                    onChange={(value) => onCoreChange({ axial_load: parseCatalogAxialLoad(value) })}
                />
                {pendingReview.axial_load ? (
                    <>
                        <p className={ADMIN_CATALOG_SECTION_HINT}>{PENDING_REVIEW_HINT}</p>
                        <Checkbox
                            id="cat-axial-review"
                            label={AXIAL_PENDING_CONFIRM}
                            checked={core.axial_load_review === "reviewed"}
                            onChange={(e) =>
                                onCoreChange({
                                    axial_load_review: e.target.checked ? "reviewed" : null,
                                })
                            }
                        />
                    </>
                ) : null}
            </FormField>
        </div>
        <FormField label="Descripción" htmlFor="cat-desc" variant={FIELD}>
            <Textarea
                id="cat-desc"
                variant={FIELD}
                rows={3}
                value={core.descripcion ?? ""}
                onChange={(e) => onCoreChange({ descripcion: e.target.value || null })}
            />
        </FormField>
        <FormField label="Instrucciones" htmlFor="cat-inst" variant={FIELD}>
            <Textarea
                id="cat-inst"
                variant={FIELD}
                rows={3}
                value={core.instrucciones ?? ""}
                onChange={(e) => onCoreChange({ instrucciones: e.target.value || null })}
            />
        </FormField>
        <FormField label="Notas" htmlFor="cat-notas" variant={FIELD}>
            <Textarea
                id="cat-notas"
                variant={FIELD}
                rows={2}
                value={core.notas ?? ""}
                onChange={(e) => onCoreChange({ notas: e.target.value || null })}
            />
        </FormField>
    </section>
);
