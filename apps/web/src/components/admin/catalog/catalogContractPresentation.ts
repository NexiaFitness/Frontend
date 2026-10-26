/**
 * catalogContractPresentation.ts — Copy y combinación de avisos de calidad + contrato (H1).
 *
 * Contexto: el listado admin recibe `quality_flags` (calidad de catálogo) y `contract_missing`
 * (lo que le falta al ejercicio para el motor). Esta función pura los une sin duplicar avisos y
 * sin mostrar «OK» cuando el contrato está incompleto.
 * Notas de mantenimiento: los códigos de contrato los define el backend (exercise_contract.py);
 * un código desconocido se muestra tal cual para no ocultarlo.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import type { ExerciseContractMissingCode } from "@nexia/shared/types/exerciseContract";
import { adminCatalogQualityFlagLabel } from "./adminCatalogPresentation";

export const CONTRACT_MISSING_LABELS: Record<ExerciseContractMissingCode, string> = {
    objetivo_entrenamiento: "Falta objetivo de entrenamiento",
    axial_load: "Falta carga axial",
    axial_load_pending_review: "Carga axial por revisar",
    nivel: "Falta nivel",
    prime_mover: "Falta músculo principal",
    primary_pattern: "Falta patrón primario",
    joint_actions: "Faltan acciones articulares",
    equipment: "Falta material",
};

/** Códigos de contrato que ya expresa un flag de calidad del listado. */
const CONTRACT_CODE_COVERED_BY_FLAG: Partial<Record<ExerciseContractMissingCode, string>> = {
    prime_mover: "NO_PM",
    primary_pattern: "NO_PRIMARY_PATTERN",
    joint_actions: "INCOMPLETE_JOINT_ACTIONS",
    equipment: "NO_EQUIPMENT",
};

export interface CatalogStatusBadge {
    key: string;
    label: string;
    tone: "ok" | "warning";
}

export function contractMissingLabel(code: string): string {
    return CONTRACT_MISSING_LABELS[code as ExerciseContractMissingCode] ?? code;
}

export function catalogStatusBadges(
    qualityFlags: string[],
    contractMissing: readonly string[] | null | undefined
): CatalogStatusBadge[] {
    const missing = contractMissing ?? [];
    const flags = missing.length > 0 ? qualityFlags.filter((flag) => flag !== "OK") : qualityFlags;
    const badges: CatalogStatusBadge[] = flags.map((flag) => ({
        key: flag,
        label: adminCatalogQualityFlagLabel(flag),
        tone: flag === "OK" ? "ok" : "warning",
    }));
    for (const code of missing) {
        const coveringFlag = CONTRACT_CODE_COVERED_BY_FLAG[code as ExerciseContractMissingCode];
        if (coveringFlag && flags.includes(coveringFlag)) continue;
        badges.push({ key: `contract-${code}`, label: contractMissingLabel(code), tone: "warning" });
    }
    return badges;
}
