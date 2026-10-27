/**
 * SessionSafetySummarySection.tsx — Resumen de seguridad de una sesión (validación).
 *
 * Contexto: extraído de SessionValidationContent (límite de tamaño, H4). Muestra los recuentos
 * de `safety_summary` y la lista de ejercicios bloqueantes, con advertencia y no verificables.
 * Un ejercicio sin acciones articulares sale como «No se pudo comprobar», nunca como seguro
 * (SPEC_H4 §3.6).
 * Notas de mantenimiento: copy y clases en sessionSafetySummaryPresentation.ts.
 *
 * @author Frontend Team
 * @since @nexia/shared 2.0.0 (H4)
 */

import React from "react";
import { NexiaSemanticIcon } from "@/components/ui/feedback";
import type { NexiaSemanticTone } from "@/components/ui/feedback/nexiaSemanticIconPresentation";
import type {
    ExerciseSafetyResponse,
    SessionSafetySummaryOut,
} from "@nexia/shared/types/engineSafety";
import {
    SESSION_SAFETY_COPY,
    SESSION_SAFETY_EMPTY,
    SESSION_SAFETY_ITEM_ICON,
    SESSION_SAFETY_ITEM_TEXT,
    SESSION_SAFETY_KPI_GRID,
    SESSION_SAFETY_KPI_LABEL,
    SESSION_SAFETY_KPI_VALUE,
    SESSION_SAFETY_LIST,
    SESSION_SAFETY_STACK,
    type SafetyKpiTone,
    sessionSafetyItemClass,
    sessionSafetyKpiClass,
    sessionSafetyListTitleClass,
} from "./sessionSafetySummaryPresentation";

interface SafetyGroup {
    key: string;
    tone: SafetyKpiTone;
    icon: NexiaSemanticTone;
    title: string;
    fallback: string;
    items: ExerciseSafetyResponse[];
}

function groupsOf(details: ExerciseSafetyResponse[]): SafetyGroup[] {
    return [
        {
            key: "blocking",
            tone: "destructive" as const,
            icon: "error" as const,
            title: SESSION_SAFETY_COPY.blockingTitle,
            fallback: SESSION_SAFETY_COPY.blockingFallback,
            items: details.filter((d) => d.status === "unsafe" && d.blocking),
        },
        {
            key: "warning",
            tone: "warning" as const,
            icon: "warning" as const,
            title: SESSION_SAFETY_COPY.warningTitle,
            fallback: SESSION_SAFETY_COPY.warningFallback,
            items: details.filter((d) => d.status === "unsafe" && !d.blocking),
        },
        {
            key: "unverifiable",
            tone: "muted" as const,
            icon: "info" as const,
            title: SESSION_SAFETY_COPY.unverifiableTitle,
            fallback: SESSION_SAFETY_COPY.unverifiableFallback,
            items: details.filter((d) => d.status === "not_verifiable"),
        },
    ].filter((group) => group.items.length > 0);
}

export const SessionSafetySummarySection: React.FC<{ data: SessionSafetySummaryOut | undefined }> = ({
    data,
}) => {
    if (!data) return <p className={SESSION_SAFETY_EMPTY}>{SESSION_SAFETY_COPY.empty}</p>;
    const kpis: Array<[SafetyKpiTone, number, string]> = [
        ["success", data.safe_count, SESSION_SAFETY_COPY.safe],
        ["warning", data.warning_count, SESSION_SAFETY_COPY.warning],
        ["destructive", data.blocking_count, SESSION_SAFETY_COPY.blocking],
        ["muted", data.unverifiable_count, SESSION_SAFETY_COPY.unverifiable],
    ];
    return (
        <div className={SESSION_SAFETY_STACK}>
            <div className={SESSION_SAFETY_KPI_GRID}>
                {kpis.map(([tone, value, label]) => (
                    <div key={label} className={sessionSafetyKpiClass(tone)}>
                        <p className={SESSION_SAFETY_KPI_VALUE}>{value}</p>
                        <p className={SESSION_SAFETY_KPI_LABEL}>{label}</p>
                    </div>
                ))}
            </div>
            {groupsOf(data.details).map((group) => (
                <div key={group.key} className={SESSION_SAFETY_LIST}>
                    <p className={sessionSafetyListTitleClass(group.tone)}>{group.title}</p>
                    {group.items.map((d, i) => (
                        <div key={`${group.key}-${i}`} className={sessionSafetyItemClass(group.tone)}>
                            <NexiaSemanticIcon tone={group.icon} size="sm" className={SESSION_SAFETY_ITEM_ICON} />
                            <p className={SESSION_SAFETY_ITEM_TEXT}>{d.reason ?? group.fallback}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
