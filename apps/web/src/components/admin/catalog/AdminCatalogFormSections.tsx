/**
 * AdminCatalogFormSections.tsx — Relaciones de la ficha admin.
 *
 * Contexto: extraídas de AdminExerciseCatalogForm (H5, SPEC §2.6) para que la
 * ficha deje de crecer. Músculos viven en AdminCatalogMuscleSection por el
 * límite de 400 líneas.
 * Notas: el markup y los handlers de cada fila son los de la ficha original.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { FormCombobox } from "@/components/ui/forms";
import type { CatalogPatternRole } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_ADD_ROW,
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_CHIP_LIST,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FIELD_GROW,
    ADMIN_CATALOG_ROW,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_SECTION_TITLE,
} from "./adminCatalogPresentation";
import { AdminCatalogRelationsSection } from "./AdminCatalogRelationsSection";
import { AdminCatalogSearchPicker } from "./AdminCatalogSearchPicker";
import {
    nextRowKey,
    type AdminCatalogFormDraft,
    type AdminCatalogSectionId,
} from "./adminCatalogFormTypes";
import {
    AdminCatalogMuscleSection,
    type CatalogPickerOption,
} from "./AdminCatalogMuscleSection";

const PATTERN_ROLE_OPTIONS = [
    { value: "primary", label: ADMIN_CATALOG_COPY.rolePrimary },
    { value: "secondary", label: ADMIN_CATALOG_COPY.roleSecondary },
];

interface StringOption {
    value: string;
    label: string;
}

export interface AdminCatalogFormSectionsProps {
    draft: AdminCatalogFormDraft;
    setDraft: React.Dispatch<React.SetStateAction<AdminCatalogFormDraft>>;
    clientErrors: Partial<Record<AdminCatalogSectionId, string[]>>;
    sectionClass: (id: AdminCatalogSectionId) => string;
    muscleOptions: CatalogPickerOption[];
    patternOptions: StringOption[];
    jointOptions: StringOption[];
    actionSearchOptions: CatalogPickerOption[];
    equipmentOptions: CatalogPickerOption[];
    tagOptions: CatalogPickerOption[];
    currentPk: number | null;
}

export const AdminCatalogFormSections: React.FC<AdminCatalogFormSectionsProps> = (props) => {
    const {
        draft,
        setDraft,
        clientErrors,
        sectionClass,
        muscleOptions,
        patternOptions,
        jointOptions,
        actionSearchOptions,
        equipmentOptions,
        tagOptions,
        currentPk,
    } = props;

    return (
        <>
            <AdminCatalogMuscleSection
                draft={draft}
                setDraft={setDraft}
                clientErrors={clientErrors}
                sectionClass={sectionClass}
                muscleOptions={muscleOptions}
            />
            {/* PATRONES */}
            <section id="patrones" className={sectionClass("patrones")}>
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionPatrones}
                </h2>
                {(clientErrors.patrones ?? []).map((msg) => (
                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {msg}
                    </Alert>
                ))}
                <div className="space-y-3">
                    {draft.patterns.map((row) => (
                        <div key={row.key} className={ADMIN_CATALOG_ROW}>
                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                <FormCombobox
                                    variant="premium"
                                    value={
                                        row.movement_pattern_id != null
                                            ? String(row.movement_pattern_id)
                                            : ""
                                    }
                                    options={patternOptions}
                                    placeholder="Patrón"
                                    onChange={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            patterns: prev.patterns.map((p) =>
                                                p.key === row.key
                                                    ? {
                                                          ...p,
                                                          movement_pattern_id: Number(value),
                                                      }
                                                    : p
                                            ),
                                        }))
                                    }
                                />
                            </div>
                            <FormCombobox
                                variant="premium"
                                value={row.role}
                                options={PATTERN_ROLE_OPTIONS}
                                onChange={(value) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        patterns: prev.patterns.map((p) =>
                                            p.key === row.key
                                                ? {
                                                      ...p,
                                                      role: value as CatalogPatternRole,
                                                  }
                                                : p
                                        ),
                                    }))
                                }
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={ADMIN_CATALOG_COPY.removeRow}
                                onClick={() =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        patterns: prev.patterns.filter((p) => p.key !== row.key),
                                    }))
                                }
                            >
                                <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className={ADMIN_CATALOG_ADD_ROW}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        onClick={() =>
                            setDraft((prev) => ({
                                ...prev,
                                patterns: [
                                    ...prev.patterns,
                                    {
                                        key: nextRowKey("p"),
                                        movement_pattern_id: null,
                                        role: "secondary",
                                    },
                                ],
                            }))
                        }
                    >
                        <Plus className="h-4 w-4" aria-hidden />
                        {ADMIN_CATALOG_COPY.addPattern}
                    </Button>
                </div>
            </section>

            {/* ARTICULACIONES */}
            <section id="articulaciones" className={sectionClass("articulaciones")}>
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionArticulaciones}
                </h2>
                <p className={ADMIN_CATALOG_SECTION_HINT}>{ADMIN_CATALOG_COPY.jointsHint}</p>
                <p className={ADMIN_CATALOG_SECTION_HINT}>
                    {ADMIN_CATALOG_COPY.jointsBridgeHint}
                </p>
                {(clientErrors.articulaciones ?? []).map((msg) => (
                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {msg}
                    </Alert>
                ))}
                <div className="space-y-3">
                    {draft.joints.map((row) => (
                        <div key={row.key} className={ADMIN_CATALOG_ROW}>
                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                <FormCombobox
                                    variant="premium"
                                    value={row.joint_id != null ? String(row.joint_id) : ""}
                                    options={jointOptions}
                                    placeholder="Articulación"
                                    onChange={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            joints: prev.joints.map((j) =>
                                                j.key === row.key
                                                    ? { ...j, joint_id: Number(value) }
                                                    : j
                                            ),
                                        }))
                                    }
                                />
                            </div>
                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                <AdminCatalogSearchPicker
                                    options={actionSearchOptions}
                                    onSelect={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            joints: prev.joints.map((j) =>
                                                j.key === row.key
                                                    ? { ...j, action_id: value }
                                                    : j
                                            ),
                                        }))
                                    }
                                />
                                {row.action_id ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Acción:{" "}
                                        {actionSearchOptions.find((a) => a.value === row.action_id)
                                            ?.label ?? row.action_id}
                                    </p>
                                ) : null}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={ADMIN_CATALOG_COPY.removeRow}
                                onClick={() =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        joints: prev.joints.filter((j) => j.key !== row.key),
                                    }))
                                }
                            >
                                <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className={ADMIN_CATALOG_ADD_ROW}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        onClick={() =>
                            setDraft((prev) => ({
                                ...prev,
                                joints: [
                                    ...prev.joints,
                                    {
                                        key: nextRowKey("j"),
                                        joint_id: null,
                                        action_id: null,
                                        role: "primary",
                                    },
                                ],
                            }))
                        }
                    >
                        <Plus className="h-4 w-4" aria-hidden />
                        {ADMIN_CATALOG_COPY.addJoint}
                    </Button>
                </div>
            </section>

            {/* MATERIAL */}
            <section id="material" className={sectionClass("material")}>
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionMaterial}
                </h2>
                {(clientErrors.material ?? []).map((msg) => (
                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {msg}
                    </Alert>
                ))}
                <div className={ADMIN_CATALOG_CHIP_LIST}>
                    {draft.equipment_ids.map((id) => {
                        const label =
                            equipmentOptions.find((e) => e.value === id)?.label ?? String(id);
                        return (
                            <Button
                                key={id}
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        equipment_ids: prev.equipment_ids.filter((x) => x !== id),
                                    }))
                                }
                            >
                                {label} ×
                            </Button>
                        );
                    })}
                </div>
                <AdminCatalogSearchPicker
                    options={equipmentOptions}
                    excludeValues={draft.equipment_ids}
                    onSelect={(value) =>
                        setDraft((prev) => ({
                            ...prev,
                            equipment_ids: [...prev.equipment_ids, value],
                        }))
                    }
                    data-testid="admin-catalog-equipment-picker"
                />
            </section>

            {/* ETIQUETAS */}
            <section id="etiquetas" className={sectionClass("etiquetas")}>
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionEtiquetas}
                </h2>
                <div className={ADMIN_CATALOG_CHIP_LIST}>
                    {draft.tag_ids.map((id) => {
                        const label =
                            tagOptions.find((t) => t.value === id)?.label ?? String(id);
                        return (
                            <Button
                                key={id}
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        tag_ids: prev.tag_ids.filter((x) => x !== id),
                                    }))
                                }
                            >
                                {label} ×
                            </Button>
                        );
                    })}
                </div>
                <AdminCatalogSearchPicker
                    options={tagOptions}
                    excludeValues={draft.tag_ids}
                    onSelect={(value) =>
                        setDraft((prev) => ({
                            ...prev,
                            tag_ids: [...prev.tag_ids, value],
                        }))
                    }
                />
            </section>

            <AdminCatalogRelationsSection exercisePk={currentPk} />
        </>
    );
};
