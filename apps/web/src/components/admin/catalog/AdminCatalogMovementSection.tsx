/**
 * AdminCatalogMovementSection.tsx — Contenido de la tarjeta «Movimiento»: patrón y articulaciones.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §3). Patrones como chips con el color de su familia
 * (PatternBadge, DESIGN_PREMIUM §3.1) y su rol; un secundario pasa a primario pulsando su
 * rol. Articulaciones en dos pasos con el mismo selector: primero la articulación y, en el
 * mismo sitio, el movimiento («Codo: elige el movimiento»).
 * Notas de mantenimiento: solo pinta; las operaciones están en adminCatalogDraft. El
 * vínculo articulación-movimiento válido no existe aún en la base (joint_valid_movements),
 * así que se ofrecen todos los movimientos activos, como antes.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React, { useMemo, useRef, useState } from "react";
import { uiBucketToTailwindKey } from "@nexia/shared";
import { RemovableChip } from "@/components/ui/chips";
import { NexiaSearchPicker } from "@/components/ui/forms";
import { PATTERN_BADGE_IDLE_BUCKET_CLASS } from "@/components/trainingPlans/periodization/patternBadgePresentation";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import {
    addJointAction,
    addPattern,
    jointActionsTaken,
    removeJointAction,
    removePattern,
    setPrimaryPattern,
    takenIds,
    toggleJointRole,
} from "./adminCatalogDraft";
import {
    FICHA_ADD,
    FICHA_CHIPS,
    FICHA_ERRORS,
    FICHA_GROUP,
    FICHA_GROUP_LABEL,
    FICHA_ROLE_BUTTON,
    FICHA_ROLE_TAG,
    FICHA_COPY,
    MOVEMENT_COPY,
} from "./adminCatalogFichaPresentation";
import type { AdminCatalogOptions } from "./useAdminCatalogOptions";

type Update = (change: (draft: AdminCatalogFormDraft) => AdminCatalogFormDraft) => void;

export interface AdminCatalogMovementSectionProps {
    draft: AdminCatalogFormDraft;
    update: Update;
    options: AdminCatalogOptions;
    errors: string[];
}

function JointPicker({ draft, update, options }: Omit<AdminCatalogMovementSectionProps, "errors">) {
    const wrapper = useRef<HTMLSpanElement>(null);
    const anchor = useRef<HTMLElement | null>(null);
    const [jointId, setJointId] = useState<number | null>(null);
    const taken = useMemo(
        () => (jointId == null ? new Map<number, string>() : jointActionsTaken(draft, jointId, FICHA_COPY.taken)),
        [draft, jointId]
    );
    return (
        <span ref={wrapper}>
            <NexiaSearchPicker
                title={MOVEMENT_COPY.addJoint}
                triggerLabel={MOVEMENT_COPY.addJoint}
                triggerClassName={FICHA_ADD}
                options={options.joints.options}
                searchPlaceholder={MOVEMENT_COPY.jointSearch}
                emptyText={MOVEMENT_COPY.jointEmpty}
                onSelect={(id) => {
                    anchor.current = wrapper.current?.querySelector("button") ?? null;
                    setJointId(id);
                }}
            />
            <NexiaSearchPicker
                title={jointId == null ? "" : MOVEMENT_COPY.actionTitle(options.joints.name(jointId))}
                open={jointId != null}
                onOpenChange={(open) => (open ? undefined : setJointId(null))}
                anchorRef={anchor}
                options={options.actions.options}
                unavailable={taken}
                searchPlaceholder={MOVEMENT_COPY.actionSearch}
                emptyText={MOVEMENT_COPY.actionEmpty}
                onSelect={(actionId) => {
                    if (jointId != null) update((d) => addJointAction(d, jointId, actionId));
                }}
            />
        </span>
    );
}

export const AdminCatalogMovementSection: React.FC<AdminCatalogMovementSectionProps> = ({
    draft,
    update,
    options,
    errors,
}) => {
    const takenPatterns = useMemo(
        () => takenIds(draft.patterns.map((p) => p.movement_pattern_id), FICHA_COPY.taken),
        [draft.patterns]
    );
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
                <h3 className={FICHA_GROUP_LABEL}>{MOVEMENT_COPY.patterns}</h3>
                <div className={FICHA_CHIPS}>
                    {draft.patterns.map((row) => {
                        const name = options.patterns.name(row.movement_pattern_id);
                        const bucket = uiBucketToTailwindKey(options.patternBucket(row.movement_pattern_id));
                        return (
                            <RemovableChip
                                key={row.key}
                                label={name}
                                toneClassName={PATTERN_BADGE_IDLE_BUCKET_CLASS[bucket]}
                                removeLabel={MOVEMENT_COPY.remove(name)}
                                onRemove={() => update((d) => removePattern(d, row.key))}
                            >
                                {row.role === "primary" ? (
                                    <span className={FICHA_ROLE_TAG}>{MOVEMENT_COPY.primary}</span>
                                ) : (
                                    <button
                                        type="button"
                                        className={FICHA_ROLE_BUTTON}
                                        aria-label={MOVEMENT_COPY.makePrimary(name)}
                                        onClick={() => update((d) => setPrimaryPattern(d, row.key))}
                                    >
                                        {MOVEMENT_COPY.secondary}
                                    </button>
                                )}
                            </RemovableChip>
                        );
                    })}
                    <NexiaSearchPicker
                        title={MOVEMENT_COPY.addPattern}
                        triggerLabel={MOVEMENT_COPY.addPattern}
                        triggerClassName={FICHA_ADD}
                        options={options.patterns.options}
                        unavailable={takenPatterns}
                        searchPlaceholder={MOVEMENT_COPY.patternSearch}
                        emptyText={MOVEMENT_COPY.patternEmpty}
                        onSelect={(id) => update((d) => addPattern(d, id))}
                    />
                </div>
            </div>
            <div className={FICHA_GROUP}>
                <h3 className={FICHA_GROUP_LABEL}>{MOVEMENT_COPY.joints}</h3>
                <div className={FICHA_CHIPS}>
                    {draft.joints.map((row) => {
                        const name = `${options.joints.name(row.joint_id)} · ${options.actions
                            .name(row.action_id)
                            .toLocaleLowerCase("es")}`;
                        return (
                            <RemovableChip
                                key={row.key}
                                label={name}
                                removeLabel={MOVEMENT_COPY.remove(name)}
                                onRemove={() => update((d) => removeJointAction(d, row.key))}
                            >
                                <button
                                    type="button"
                                    className={FICHA_ROLE_BUTTON}
                                    aria-label={`${name}: ${
                                        row.role === "primary" ? MOVEMENT_COPY.primary : MOVEMENT_COPY.secondary
                                    }`}
                                    aria-pressed={row.role === "primary"}
                                    onClick={() => update((d) => toggleJointRole(d, row.key))}
                                >
                                    {row.role === "primary" ? MOVEMENT_COPY.primary : MOVEMENT_COPY.secondary}
                                </button>
                            </RemovableChip>
                        );
                    })}
                    <JointPicker draft={draft} update={update} options={options} />
                </div>
            </div>
        </>
    );
};
