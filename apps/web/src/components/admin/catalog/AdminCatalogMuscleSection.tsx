/**
 * AdminCatalogMuscleSection.tsx — Contenido de la tarjeta «Músculos» de la ficha admin.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §3). Tres grupos fijos: Objetivo (con número y
 * flechas: el orden es la prioridad, sin arrastre), Sinergistas y Estabilizadores (chips).
 * Cada grupo añade con NexiaSearchPicker; un músculo que ya está en otro grupo se ve
 * desactivado con el motivo. Cambiar de rol es quitarlo y añadirlo en el otro grupo.
 * Notas de mantenimiento: solo pinta; las operaciones están en adminCatalogDraft.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React, { useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { CatalogMuscleRole } from "@nexia/shared/types/adminCatalog";
import { RemovableChip } from "@/components/ui/chips";
import { NexiaSearchPicker } from "@/components/ui/forms";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import {
    addMuscle,
    movePrimeMover,
    muscleUnavailable,
    removeMuscle,
} from "./adminCatalogDraft";
import {
    FICHA_ADD,
    FICHA_CHIPS,
    FICHA_EMPTY,
    FICHA_ERRORS,
    FICHA_GROUP,
    FICHA_GROUP_HEAD,
    FICHA_GROUP_HINT,
    FICHA_GROUP_LABEL,
    FICHA_ICON_BUTTON,
    FICHA_ICON_BUTTON_DANGER,
    FICHA_PM_INDEX,
    FICHA_PM_LIST,
    FICHA_PM_NAME,
    FICHA_PM_ROW,
    FICHA_COPY,
    MUSCLE_COPY,
} from "./adminCatalogFichaPresentation";
import type { CatalogOptionList } from "./useAdminCatalogOptions";

type Update = (change: (draft: AdminCatalogFormDraft) => AdminCatalogFormDraft) => void;

export interface AdminCatalogMuscleSectionProps {
    draft: AdminCatalogFormDraft;
    update: Update;
    muscles: CatalogOptionList;
    errors: string[];
}

function Picker({
    role,
    draft,
    update,
    muscles,
}: {
    role: CatalogMuscleRole;
    draft: AdminCatalogFormDraft;
    update: Update;
    muscles: CatalogOptionList;
}) {
    const unavailable = useMemo(() => muscleUnavailable(draft, MUSCLE_COPY.taken), [draft]);
    return (
        <NexiaSearchPicker
            title={MUSCLE_COPY.pickerTitle[role]}
            triggerLabel={role === "prime_mover" ? MUSCLE_COPY.addPrime : MUSCLE_COPY.add}
            triggerClassName={FICHA_ADD}
            options={muscles.options}
            unavailable={unavailable}
            searchPlaceholder={MUSCLE_COPY.search}
            emptyText={MUSCLE_COPY.empty}
            onSelect={(id) => update((d) => addMuscle(d, id, role))}
        />
    );
}

export const AdminCatalogMuscleSection: React.FC<AdminCatalogMuscleSectionProps> = ({
    draft,
    update,
    muscles,
    errors,
}) => {
    const primeMovers = draft.muscles.filter((m) => m.role === "prime_mover");
    const others = (role: CatalogMuscleRole) => draft.muscles.filter((m) => m.role === role);

    return (
        <>
            {errors.length > 0 ? (
                <ul className={FICHA_ERRORS} role="alert">
                    {errors.map((message) => (
                        <li key={message}>{message}</li>
                    ))}
                </ul>
            ) : null}
            <div className={FICHA_GROUP}>
                <div className={FICHA_GROUP_HEAD}>
                    <h3 className={FICHA_GROUP_LABEL}>{MUSCLE_COPY.groups.prime_mover}</h3>
                    <span className={FICHA_GROUP_HINT}>{MUSCLE_COPY.primeHint}</span>
                </div>
                {primeMovers.length > 0 ? (
                    <ol className={FICHA_PM_LIST}>
                        {primeMovers.map((row, index) => {
                            const name = muscles.name(row.muscle_id);
                            return (
                                <li key={row.key} className={FICHA_PM_ROW}>
                                    <span className={FICHA_PM_INDEX}>{index + 1}</span>
                                    <span className={FICHA_PM_NAME}>{name}</span>
                                    <button
                                        type="button"
                                        className={FICHA_ICON_BUTTON}
                                        aria-label={MUSCLE_COPY.moveUp(name)}
                                        disabled={index === 0}
                                        onClick={() => update((d) => movePrimeMover(d, row.key, -1))}
                                    >
                                        <ChevronUp aria-hidden />
                                    </button>
                                    <button
                                        type="button"
                                        className={FICHA_ICON_BUTTON}
                                        aria-label={MUSCLE_COPY.moveDown(name)}
                                        disabled={index === primeMovers.length - 1}
                                        onClick={() => update((d) => movePrimeMover(d, row.key, 1))}
                                    >
                                        <ChevronDown aria-hidden />
                                    </button>
                                    <button
                                        type="button"
                                        className={FICHA_ICON_BUTTON_DANGER}
                                        aria-label={MUSCLE_COPY.remove(name)}
                                        onClick={() => update((d) => removeMuscle(d, row.key))}
                                    >
                                        <X aria-hidden />
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                ) : null}
                <Picker role="prime_mover" draft={draft} update={update} muscles={muscles} />
            </div>
            {(["synergist", "stabilizer"] as const).map((role) => (
                <div key={role} className={FICHA_GROUP}>
                    <h3 className={FICHA_GROUP_LABEL}>{MUSCLE_COPY.groups[role]}</h3>
                    <div className={FICHA_CHIPS}>
                        {others(role).length === 0 ? <span className={FICHA_EMPTY}>{FICHA_COPY.none}</span> : null}
                        {others(role).map((row) => {
                            const name = muscles.name(row.muscle_id);
                            return (
                                <RemovableChip
                                    key={row.key}
                                    label={name}
                                    removeLabel={MUSCLE_COPY.remove(name)}
                                    onRemove={() => update((d) => removeMuscle(d, row.key))}
                                />
                            );
                        })}
                        <Picker role={role} draft={draft} update={update} muscles={muscles} />
                    </div>
                </div>
            ))}
        </>
    );
};
