/**
 * AdminCatalogRelationsSection.tsx — Contenido de la tarjeta «Alternativas y variantes» (M6 F2).
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §3, D-H10-6). Las alternativas se guardan al
 * añadirlas o quitarlas (su propia API), no con «Guardar», y la tarjeta lo dice. Las
 * variantes se leen aquí y se crean desde la variante.
 * Notas de mantenimiento: en el alta no hay ejercicio todavía: solo el aviso. Quitar pide
 * confirmación (NexiaPremiumConfirmModal).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import {
    useCreateAlternativeMutation,
    useDeleteAlternativeMutation,
    useGetExerciseAlternativesQuery,
} from "@nexia/shared/api/exerciseAlternativesApi";
import { useListAdminCatalogExercisesQuery } from "@nexia/shared/api/adminCatalogApi";
import { useGetExerciseVariantsQuery } from "@nexia/shared/api/exercisesApi";
import { useToast } from "@/components/ui/feedback";
import { NexiaSearchPicker } from "@/components/ui/forms";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { ADMIN_CATALOG_COPY } from "./adminCatalogPresentation";
import {
    FICHA_ADD,
    FICHA_EMPTY,
    FICHA_GROUP,
    FICHA_GROUP_HEAD,
    FICHA_GROUP_HINT,
    FICHA_GROUP_LABEL,
    FICHA_ICON_BUTTON_DANGER,
    FICHA_PM_LIST,
    FICHA_RELATION_LINK,
    FICHA_RELATION_ROW,
    FICHA_COPY,
    RELATIONS_COPY,
} from "./adminCatalogFichaPresentation";

export interface AdminCatalogRelationsSectionProps {
    exercisePk: number | null;
}

export const AdminCatalogRelationsSection: React.FC<AdminCatalogRelationsSectionProps> = ({ exercisePk }) => {
    const { showSuccess, showError } = useToast();
    const [removeId, setRemoveId] = useState<number | null>(null);
    const skip = exercisePk == null;
    const { data: alternatives = [] } = useGetExerciseAlternativesQuery(exercisePk ?? 0, { skip });
    const { data: variants = [] } = useGetExerciseVariantsQuery(
        { base_exercise_id: exercisePk ?? 0, is_active: true },
        { skip }
    );
    const { data: catalogList } = useListAdminCatalogExercisesQuery(
        { skip: 0, limit: 500, include_inactive: false },
        { skip }
    );
    const [createAlt] = useCreateAlternativeMutation();
    const [deleteAlt, { isLoading: deleting }] = useDeleteAlternativeMutation();

    const options = useMemo(
        () =>
            (catalogList?.items ?? [])
                .filter((item) => item.exercise_pk !== exercisePk)
                .map((item) => ({ value: item.exercise_pk, label: item.nombre, hint: item.exercise_code })),
        [catalogList?.items, exercisePk]
    );
    const taken = useMemo(
        () => new Map(alternatives.map((alt) => [alt.alternative_exercise_id, FICHA_COPY.taken])),
        [alternatives]
    );
    const nextPriority = alternatives.reduce((max, a) => Math.max(max, a.priority ?? 0), 0) + 1;

    if (exercisePk == null) {
        return <p className={FICHA_EMPTY}>{RELATIONS_COPY.saveFirst}</p>;
    }

    const handleAdd = async (alternativePk: number) => {
        try {
            await createAlt({
                exercise_id: exercisePk,
                alternative_exercise_id: alternativePk,
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
            showSuccess(ADMIN_CATALOG_COPY.altRemovedToast);
        } catch {
            showError(ADMIN_CATALOG_COPY.altRemoveError);
        } finally {
            setRemoveId(null);
        }
    };

    return (
        <>
            <div className={FICHA_GROUP} data-testid="admin-catalog-alternatives">
                <div className={FICHA_GROUP_HEAD}>
                    <h3 className={FICHA_GROUP_LABEL}>{RELATIONS_COPY.alternatives}</h3>
                    <span className={FICHA_GROUP_HINT}>{RELATIONS_COPY.savedOnAdd}</span>
                </div>
                {alternatives.length === 0 ? (
                    <p className={FICHA_EMPTY}>{RELATIONS_COPY.alternativesEmpty}</p>
                ) : (
                    <ul className={FICHA_PM_LIST}>
                        {alternatives.map((alt) => {
                            const name = alt.alternative_exercise_name ?? `#${alt.alternative_exercise_id}`;
                            return (
                                <li key={alt.id} className={FICHA_RELATION_ROW}>
                                    <Link
                                        to={`/dashboard/admin/catalog/${alt.alternative_exercise_id}`}
                                        className={FICHA_RELATION_LINK}
                                    >
                                        {name}
                                    </Link>
                                    <button
                                        type="button"
                                        className={FICHA_ICON_BUTTON_DANGER}
                                        aria-label={RELATIONS_COPY.remove(name)}
                                        onClick={() => setRemoveId(alt.id)}
                                    >
                                        <X aria-hidden />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <NexiaSearchPicker
                    title={RELATIONS_COPY.pickerTitle}
                    triggerLabel={RELATIONS_COPY.add}
                    triggerClassName={FICHA_ADD}
                    options={options}
                    unavailable={taken}
                    searchPlaceholder={RELATIONS_COPY.search}
                    emptyText={RELATIONS_COPY.empty}
                    onSelect={(id) => void handleAdd(id)}
                />
            </div>
            <div className={FICHA_GROUP} data-testid="admin-catalog-variants">
                <h3 className={FICHA_GROUP_LABEL}>{RELATIONS_COPY.variants}</h3>
                {variants.length === 0 ? (
                    <p className={FICHA_EMPTY}>{RELATIONS_COPY.variantsEmpty}</p>
                ) : (
                    <ul className={FICHA_PM_LIST}>
                        {variants.map((variant) => (
                            <li key={variant.id} className={FICHA_RELATION_ROW}>
                                <span>{variant.name_es || variant.name_en}</span>
                                <span className={FICHA_GROUP_HINT}>{variant.variant_type}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
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
