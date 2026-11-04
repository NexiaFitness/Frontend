/**
 * AdminCatalogMuscleSection.tsx — Filas de músculo de la ficha admin.
 *
 * Contexto: extraída de AdminExerciseCatalogForm (H5, límite de 400 líneas).
 * El arrastre reordena solo los prime movers; el resto del draft no cambia.
 * Notas: mismo markup que la ficha original. Sin regla nueva.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React, { useCallback } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { FormCombobox } from "@/components/ui/forms";
import type { CatalogMuscleRole } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_ADD_ROW,
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FIELD_GROW,
    ADMIN_CATALOG_ROW,
    ADMIN_CATALOG_ROW_DRAG,
    ADMIN_CATALOG_ROW_DRAG_HANDLE,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_SECTION_TITLE,
} from "./adminCatalogPresentation";
import { AdminCatalogSearchPicker } from "./AdminCatalogSearchPicker";
import {
    nextRowKey,
    retargetMuscleRow,
    type AdminCatalogFormDraft,
    type AdminCatalogSectionId,
} from "./adminCatalogFormTypes";

export interface CatalogPickerOption {
    value: number;
    label: string;
}

const MUSCLE_ROLE_OPTIONS = [
    { value: "prime_mover", label: ADMIN_CATALOG_COPY.rolePrimeMover },
    { value: "synergist", label: ADMIN_CATALOG_COPY.roleSynergist },
    { value: "stabilizer", label: ADMIN_CATALOG_COPY.roleStabilizer },
];

export interface AdminCatalogMuscleSectionProps {
    draft: AdminCatalogFormDraft;
    setDraft: React.Dispatch<React.SetStateAction<AdminCatalogFormDraft>>;
    clientErrors: Partial<Record<AdminCatalogSectionId, string[]>>;
    sectionClass: (id: AdminCatalogSectionId) => string;
    muscleOptions: CatalogPickerOption[];
}

export const AdminCatalogMuscleSection: React.FC<AdminCatalogMuscleSectionProps> = ({
    draft,
    setDraft,
    clientErrors,
    sectionClass,
    muscleOptions,
}) => {
    const pmRows = draft.muscles.filter((m) => m.role === "prime_mover");
    const otherMuscleRows = draft.muscles.filter((m) => m.role !== "prime_mover");

    const onPmDragStart = useCallback((index: number) => (event: React.DragEvent) => {
        event.dataTransfer.setData("text/plain", String(index));
        event.dataTransfer.effectAllowed = "move";
    }, []);

    const onPmDrop = useCallback(
        (targetIndex: number) => (event: React.DragEvent) => {
            event.preventDefault();
            const from = Number(event.dataTransfer.getData("text/plain"));
            if (!Number.isFinite(from) || from === targetIndex) return;
            setDraft((prev) => {
                const pm = prev.muscles.filter((m) => m.role === "prime_mover");
                const rest = prev.muscles.filter((m) => m.role !== "prime_mover");
                if (from < 0 || from >= pm.length || targetIndex < 0 || targetIndex >= pm.length) {
                    return prev;
                }
                const nextPm = [...pm];
                const [item] = nextPm.splice(from, 1);
                nextPm.splice(targetIndex, 0, item);
                return { ...prev, muscles: [...nextPm, ...rest] };
            });
        },
        [setDraft]
    );

    return (
            <section id="musculos" className={sectionClass("musculos")}>
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionMusculos}
                </h2>
                <p className={ADMIN_CATALOG_SECTION_HINT}>
                    {ADMIN_CATALOG_COPY.musclesPmHint}
                </p>
                {(clientErrors.musculos ?? []).map((msg) => (
                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {msg}
                    </Alert>
                ))}
                <div className="space-y-3">
                    {pmRows.map((row, pmIndex) => (
                        <div
                            key={row.key}
                            className={ADMIN_CATALOG_ROW_DRAG}
                            draggable
                            onDragStart={onPmDragStart(pmIndex)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onPmDrop(pmIndex)}
                        >
                            <span
                                className={ADMIN_CATALOG_ROW_DRAG_HANDLE}
                                aria-label="Arrastrar prioridad"
                            >
                                <GripVertical className="h-4 w-4" aria-hidden />
                            </span>
                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                <AdminCatalogSearchPicker
                                    options={muscleOptions}
                                    excludeValues={draft.muscles
                                        .map((m) => m.muscle_id)
                                        .filter((id): id is number => id != null && id !== row.muscle_id)}
                                    onSelect={(value) => {
                                        const label =
                                            muscleOptions.find((o) => o.value === value)
                                                ?.label ?? String(value);
                                        setDraft((prev) => ({
                                            ...prev,
                                            muscles: prev.muscles.map((m) =>
                                                m.key === row.key
                                                    ? retargetMuscleRow(m, { muscle_id: value, label })
                                                    : m
                                            ),
                                        }));
                                    }}
                                />
                                {row.muscle_id ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Seleccionado: {row.label ?? row.muscle_id} · prioridad{" "}
                                        {pmIndex + 1}
                                    </p>
                                ) : null}
                            </div>
                            <FormCombobox
                                variant="premium"
                                value={row.role}
                                options={MUSCLE_ROLE_OPTIONS}
                                onChange={(value) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        muscles: prev.muscles.map((m) =>
                                            m.key === row.key
                                                ? retargetMuscleRow(m, { role: value as CatalogMuscleRole })
                                                : m
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
                                        muscles: prev.muscles.filter((m) => m.key !== row.key),
                                    }))
                                }
                            >
                                <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                        </div>
                    ))}
                    {otherMuscleRows.map((row) => (
                        <div key={row.key} className={ADMIN_CATALOG_ROW}>
                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                <AdminCatalogSearchPicker
                                    options={muscleOptions}
                                    excludeValues={draft.muscles
                                        .map((m) => m.muscle_id)
                                        .filter((id): id is number => id != null && id !== row.muscle_id)}
                                    onSelect={(value) => {
                                        const label =
                                            muscleOptions.find((o) => o.value === value)
                                                ?.label ?? String(value);
                                        setDraft((prev) => ({
                                            ...prev,
                                            muscles: prev.muscles.map((m) =>
                                                m.key === row.key
                                                    ? retargetMuscleRow(m, { muscle_id: value, label })
                                                    : m
                                            ),
                                        }));
                                    }}
                                />
                                {row.muscle_id ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Seleccionado: {row.label ?? row.muscle_id}
                                    </p>
                                ) : null}
                            </div>
                            <FormCombobox
                                variant="premium"
                                value={row.role}
                                options={MUSCLE_ROLE_OPTIONS}
                                onChange={(value) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        muscles: prev.muscles.map((m) =>
                                            m.key === row.key
                                                ? retargetMuscleRow(m, { role: value as CatalogMuscleRole })
                                                : m
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
                                        muscles: prev.muscles.filter((m) => m.key !== row.key),
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
                                muscles: [
                                    ...prev.muscles,
                                    {
                                        key: nextRowKey("m"),
                                        muscle_id: null,
                                        role: "synergist",
                                    },
                                ],
                            }))
                        }
                    >
                        <Plus className="h-4 w-4" aria-hidden />
                        {ADMIN_CATALOG_COPY.addMuscle}
                    </Button>
                </div>
            </section>
    );
};
