/**
 * AdminCatalogRelationsSection.tsx — Alternativas + variantes en ficha Admin (M6 F2).
 */

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
    useCreateAlternativeMutation,
    useDeleteAlternativeMutation,
    useGetExerciseAlternativesQuery,
} from "@nexia/shared/api/exerciseAlternativesApi";
import { useListAdminCatalogExercisesQuery } from "@nexia/shared/api/adminCatalogApi";
import { useGetExerciseVariantsQuery } from "@nexia/shared/api/exercisesApi";
import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { AdminCatalogSearchPicker } from "./AdminCatalogSearchPicker";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_CHIP_LIST,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_ROW,
    ADMIN_CATALOG_SECTION,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_SECTION_TITLE,
} from "./adminCatalogPresentation";

export interface AdminCatalogRelationsSectionProps {
    exercisePk: number | null;
}

export const AdminCatalogRelationsSection: React.FC<AdminCatalogRelationsSectionProps> = ({
    exercisePk,
}) => {
    const { showSuccess, showError } = useToast();
    const [removeId, setRemoveId] = useState<number | null>(null);

    const skip = exercisePk == null;
    const { data: alternatives = [], isLoading: loadingAlts } =
        useGetExerciseAlternativesQuery(exercisePk ?? 0, { skip });
    const { data: variants = [], isLoading: loadingVars } = useGetExerciseVariantsQuery(
        { base_exercise_id: exercisePk ?? 0, is_active: true },
        { skip }
    );
    const { data: catalogList } = useListAdminCatalogExercisesQuery(
        { skip: 0, limit: 500, include_inactive: false },
        { skip }
    );
    const [createAlt, { isLoading: creating }] = useCreateAlternativeMutation();
    const [deleteAlt, { isLoading: deleting }] = useDeleteAlternativeMutation();

    const pickerOptions = useMemo(() => {
        const exclude = new Set<number>([
            ...(exercisePk != null ? [exercisePk] : []),
            ...alternatives.map((a) => a.alternative_exercise_id),
        ]);
        return (catalogList?.items ?? [])
            .filter((item) => !exclude.has(item.exercise_pk))
            .map((item) => ({
                value: item.exercise_pk,
                label: `${item.nombre} (${item.exercise_code})`,
            }));
    }, [alternatives, catalogList?.items, exercisePk]);

    const nextPriority =
        alternatives.reduce((max, a) => Math.max(max, a.priority ?? 0), 0) + 1;

    const handleAdd = async (altPk: number) => {
        if (exercisePk == null) return;
        try {
            await createAlt({
                exercise_id: exercisePk,
                alternative_exercise_id: altPk,
                priority: nextPriority,
            }).unwrap();
            showSuccess(ADMIN_CATALOG_COPY.altAddedToast);
        } catch {
            showError(ADMIN_CATALOG_COPY.altAddError);
        }
    };

    const handleRemove = async () => {
        if (removeId == null) return;
        try {
            await deleteAlt(removeId).unwrap();
            setRemoveId(null);
            showSuccess(ADMIN_CATALOG_COPY.altRemovedToast);
        } catch {
            showError(ADMIN_CATALOG_COPY.altRemoveError);
        }
    };

    if (exercisePk == null) {
        return (
            <section id="alternativas" className={ADMIN_CATALOG_SECTION}>
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionAlternativas}
                </h2>
                <p className={ADMIN_CATALOG_SECTION_HINT}>
                    {ADMIN_CATALOG_COPY.altSaveFirstHint}
                </p>
            </section>
        );
    }

    return (
        <>
            <section id="alternativas" className={ADMIN_CATALOG_SECTION} data-testid="admin-catalog-alternatives">
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionAlternativas}
                </h2>
                <p className={ADMIN_CATALOG_SECTION_HINT}>{ADMIN_CATALOG_COPY.altHint}</p>
                {loadingAlts ? (
                    <p className="text-sm text-muted-foreground">Cargando…</p>
                ) : alternatives.length === 0 ? (
                    <Alert variant="info" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {ADMIN_CATALOG_COPY.altEmpty}
                    </Alert>
                ) : (
                    <ul className={ADMIN_CATALOG_CHIP_LIST}>
                        {alternatives.map((alt) => (
                            <li key={alt.id} className={ADMIN_CATALOG_ROW}>
                                <Link
                                    to={`/dashboard/admin/catalog/${alt.alternative_exercise_id}`}
                                    className="text-sm text-primary underline-offset-2 hover:underline"
                                >
                                    {alt.alternative_exercise_name ??
                                        `#${alt.alternative_exercise_id}`}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                    prior. {alt.priority}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={ADMIN_CATALOG_COPY.altRemove}
                                    onClick={() => setRemoveId(alt.id)}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-3">
                    <AdminCatalogSearchPicker
                        options={pickerOptions}
                        onSelect={(v) => void handleAdd(v)}
                        placeholder={ADMIN_CATALOG_COPY.altSearchPlaceholder}
                        data-testid="admin-catalog-alt-picker"
                    />
                    {creating ? (
                        <p className="mt-1 text-xs text-muted-foreground">Añadiendo…</p>
                    ) : null}
                </div>
            </section>

            <section id="variantes" className={ADMIN_CATALOG_SECTION} data-testid="admin-catalog-variants">
                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                    {ADMIN_CATALOG_COPY.sectionVariantes}
                </h2>
                <p className={ADMIN_CATALOG_SECTION_HINT}>{ADMIN_CATALOG_COPY.variantsHint}</p>
                {loadingVars ? (
                    <p className="text-sm text-muted-foreground">Cargando…</p>
                ) : variants.length === 0 ? (
                    <Alert variant="info" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {ADMIN_CATALOG_COPY.variantsEmpty}
                    </Alert>
                ) : (
                    <ul className={ADMIN_CATALOG_CHIP_LIST}>
                        {variants.map((v) => (
                            <li key={v.id} className={ADMIN_CATALOG_ROW}>
                                <span className="text-sm">
                                    {v.name_es || v.name_en}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {v.variant_type}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <NexiaPremiumConfirmModal
                isOpen={removeId != null}
                onClose={() => setRemoveId(null)}
                onConfirm={() => void handleRemove()}
                title={ADMIN_CATALOG_COPY.altRemoveTitle}
                description={ADMIN_CATALOG_COPY.altRemoveBody}
                confirmLabel={ADMIN_CATALOG_COPY.altRemove}
                confirmVariant="destructive"
                isLoading={deleting}
            />
        </>
    );
};
