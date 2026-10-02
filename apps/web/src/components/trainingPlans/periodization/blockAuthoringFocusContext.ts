/**
 * blockAuthoringFocusContext.ts — Breadcrumbs y meta compacta del modo foco D-PAP.
 */

import {
    TRAINING_DAY_LABELS,
    labelClientExperience,
    labelSessionDuration,
    labelTrainingGoal,
    type TrainingDayValue,
} from "@nexia/shared";
import type { Client } from "@nexia/shared/types/client";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { buildClientTabPath } from "@/lib/trainingPlanNavigation";
import type { BlockAuthorMode } from "./blockAuthoringModel";

export interface ClientAuthoringMetaItem {
    label: string;
    value: string;
}

export function formatClientDisplayName(
    client: Pick<Client, "nombre" | "apellidos">,
): string {
    return [client.nombre, client.apellidos].filter(Boolean).join(" ").trim() || "Cliente";
}

function formatClientTrainingDaysCompact(days?: string[] | null): string {
    if (!days?.length) {
        return "—";
    }
    return days
        .map((day) => TRAINING_DAY_LABELS[day as TrainingDayValue] ?? day)
        .join(", ");
}

/** Valores vacíos / placeholder — no se muestran en la meta compacta. */
const EMPTY_META_VALUES = new Set([
    "",
    "—",
    "No definido",
    "No especificada",
    "No especificado",
]);

function isMeaningfulMetaValue(value: string): boolean {
    return !EMPTY_META_VALUES.has(value.trim());
}

export function buildClientAuthoringMetaItems(
    client: Client,
): ClientAuthoringMetaItem[] {
    const candidates: ClientAuthoringMetaItem[] = [
        {
            label: "Objetivo",
            value: labelTrainingGoal(client.objetivo_entrenamiento),
        },
        {
            label: "Experiencia",
            value: labelClientExperience(client.experiencia),
        },
        {
            label: "Duración",
            value: labelSessionDuration(client.session_duration),
        },
        {
            label: "Días",
            value: formatClientTrainingDaysCompact(client.training_days),
        },
    ];
    return candidates.filter((item) => isMeaningfulMetaValue(item.value));
}

export function buildBlockAuthoringBreadcrumbs(options: {
    clientId: number;
    clientName: string;
    planId: number;
    mode: BlockAuthorMode;
}): BreadcrumbItem[] {
    const { clientId, clientName, planId, mode } = options;
    const planningPath = buildClientTabPath(clientId, {
        tab: "planning",
        planId,
    });

    return [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        {
            label: clientName,
            path: buildClientTabPath(clientId, { tab: "overview" }),
        },
        { label: "Planificación", path: planningPath },
        {
            label: mode === "create" ? "Nuevo bloque" : "Editar bloque",
            active: true,
        },
    ];
}
