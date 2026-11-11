/**
 * AdminCatalogMaterialSection.tsx — Contenido de la tarjeta «Material y etiquetas».
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §3). Dos selecciones múltiples con chips y su
 * selector con búsqueda. El material va en tinte primary (PLATFORM_EQUIP_CHIP, como en la
 * ficha del entrenador); las etiquetas, neutras.
 * Notas de mantenimiento: solo pinta; añadir y quitar son addId / removeId.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React, { useMemo } from "react";
import { RemovableChip } from "@/components/ui/chips";
import { NexiaSearchPicker } from "@/components/ui/forms";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import { addId, removeId, takenIds } from "./adminCatalogDraft";
import {
    FICHA_ADD,
    FICHA_CHIPS,
    FICHA_ERRORS,
    FICHA_GROUP,
    FICHA_GROUP_LABEL,
    FICHA_COPY,
    MATERIAL_COPY,
} from "./adminCatalogFichaPresentation";
import type { CatalogOptionList } from "./useAdminCatalogOptions";

type Update = (change: (draft: AdminCatalogFormDraft) => AdminCatalogFormDraft) => void;
type Field = "equipment_ids" | "tag_ids";

export interface AdminCatalogMaterialSectionProps {
    draft: AdminCatalogFormDraft;
    update: Update;
    equipment: CatalogOptionList;
    tags: CatalogOptionList;
    errors: string[];
}

interface GroupProps {
    field: Field;
    title: string;
    addLabel: string;
    search: string;
    empty: string;
    list: CatalogOptionList;
    tone: "primary" | "neutral";
    draft: AdminCatalogFormDraft;
    update: Update;
}

function Group({ field, title, addLabel, search, empty, list, tone, draft, update }: GroupProps) {
    const ids = draft[field];
    const taken = useMemo(() => takenIds(ids, FICHA_COPY.taken), [ids]);
    return (
        <div className={FICHA_GROUP}>
            <h3 className={FICHA_GROUP_LABEL}>{title}</h3>
            <div className={FICHA_CHIPS}>
                {ids.map((id) => (
                    <RemovableChip
                        key={id}
                        label={list.name(id)}
                        tone={tone}
                        removeLabel={MATERIAL_COPY.remove(list.name(id))}
                        onRemove={() => update((d) => ({ ...d, [field]: removeId(d[field], id) }))}
                    />
                ))}
                <NexiaSearchPicker
                    title={addLabel}
                    triggerLabel={addLabel}
                    triggerClassName={FICHA_ADD}
                    options={list.options}
                    unavailable={taken}
                    searchPlaceholder={search}
                    emptyText={empty}
                    onSelect={(id) => update((d) => ({ ...d, [field]: addId(d[field], id) }))}
                />
            </div>
        </div>
    );
}

export const AdminCatalogMaterialSection: React.FC<AdminCatalogMaterialSectionProps> = ({
    draft,
    update,
    equipment,
    tags,
    errors,
}) => (
    <>
        {errors.length > 0 ? (
            <ul className={FICHA_ERRORS} role="alert">
                {errors.map((message) => (
                    <li key={message}>{message}</li>
                ))}
            </ul>
        ) : null}
        <Group
            field="equipment_ids"
            title={MATERIAL_COPY.material}
            addLabel={MATERIAL_COPY.addMaterial}
            search={MATERIAL_COPY.materialSearch}
            empty={MATERIAL_COPY.materialEmpty}
            list={equipment}
            tone="primary"
            draft={draft}
            update={update}
        />
        <Group
            field="tag_ids"
            title={MATERIAL_COPY.tags}
            addLabel={MATERIAL_COPY.addTag}
            search={MATERIAL_COPY.tagSearch}
            empty={MATERIAL_COPY.tagEmpty}
            list={tags}
            tone="neutral"
            draft={draft}
            update={update}
        />
    </>
);
