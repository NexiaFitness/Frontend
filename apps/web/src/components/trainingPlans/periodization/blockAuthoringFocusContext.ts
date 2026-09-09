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

export function buildClientAuthoringMetaItems(
    client: Client,
): ClientAuthoringMetaItem[] {
    return [
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
