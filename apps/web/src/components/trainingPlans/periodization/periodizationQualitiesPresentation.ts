/**
 * periodizationQualitiesPresentation.ts — Copy canónico cualidades físicas (F4.2 / doc 17).
 *
 * Strings coach-facing para mix, co-primary, tooltips y advertencias de mix ambiguo.
 * Sin lógica de negocio de API — solo proyección UX sobre slugs y porcentajes.
 */

import type { PeriodBlockQualityInput, PhysicalQuality } from "@nexia/shared/types/planningCargas";

export const PHYSICAL_QUALITY_MIX_COPY = {
    stepTitle: "Prioridad de cualidades en esta fase",
    helpParagraph:
        "Los porcentajes expresan qué cualidades quieres enfatizar en esta fase, no cuántas series, minutos o ejercicios dedicas a cada una. NEXIA no reparte automáticamente el trabajo de entrenamiento según estos números.",
    percentageSuffix: "prioridad de intención",
    chartsIntentLabel:
        "Tendencia de intención relativa por fase — no volumen ni tiempo de entrenamiento.",
    coPrimaryTitle: "Co-primarias en esta fase",
    coPrimaryBody:
        "Varias cualidades comparten la misma prioridad máxima. NEXIA las trata como co-primarias — no elige una sola por orden de lista.",
    sessionCoPrimaryHint:
        "Prioridad compartida: varias cualidades al mismo nivel en esta fase.",
} as const;

/** Tooltips por slug (doc 17 §2 — los más críticos + genérico). */
export const QUALITY_SLUG_TOOLTIPS: Partial<Record<string, string>> = {
    fuerza_resistencia:
        "Énfasis en repetir bajo carga en una tarea concreta. Para feedback automático, NEXIA necesitará test o tarea vinculada (próximas versiones).",
    resistencia_anaerobica:
        "Prioridad hacia esfuerzos intensos repetidos — no confundir con cardio intenso ni velocidad. Sin análisis metabólico automático.",
    estabilidad:
        "NEXIA registra tu énfasis en control motor. No calcula una nota de estabilidad global.",
    resistencia_aerobica:
        "Prioridad en capacidad cardiorrespiratoria — distinto de cardio extensivo como método.",
    cardio_extensivo:
        "Estrategia de exposición aeróbica extensa — no es un outcome medido de resistencia aeróbica.",
    cardio_intensivo:
        "Método de trabajo intenso (HIIT, intervalos) — capa de exposición, no outcome anaeróbico.",
    velocidad:
        "Rendimiento en velocidad en tarea específica — distinto de potencia con carga.",
    movilidad:
        "Rango de movimiento articular — distinto de estabilidad o control motor.",
    equilibrio:
        "Control postural en tareas concretas — sin puntuación global automática.",
    coordinacion:
        "Habilidades de coordinación por tarea — sin score agregado automático.",
};

export interface MixAmbiguityWarning {
    id: string;
    title: string;
    body: string;
}

const AMBIGUOUS_MIX_RULES: {
    id: string;
    slugs: readonly string[];
    minActive: number;
    title: string;
    body: string;
}[] = [
    {
        id: "aerobic_outcome_method",
        slugs: ["resistencia_aerobica", "cardio_extensivo"],
        minActive: 2,
        title: "Mezcla de outcome y método aeróbico",
        body: "Has combinado resistencia aeróbica (capacidad/outcome) con cardio extensivo (estrategia de exposición). Ambos refuerzan el mismo dominio pero no son la misma capa. NEXIA registrará tu intención; la evaluación automática puede ser limitada o ambigua.",
    },
    {
        id: "anaerobic_outcome_method",
        slugs: ["resistencia_anaerobica", "cardio_intensivo"],
        minActive: 2,
        title: "No son equivalentes",
        body: "Resistencia anaeróbica expresa prioridad hacia esfuerzos intensos repetidos. Cardio intensivo describe cómo entrenar (HIIT/intervalos). NEXIA no los trata como sinónimos ni reparte estímulo automáticamente.",
    },
    {
        id: "anaerobic_intensity_layers",
        slugs: ["resistencia_anaerobica", "velocidad", "cardio_intensivo"],
        minActive: 2,
        title: "Varias capas de intensidad/sprint",
        body: "Estás mezclando intenciones relacionadas (anaeróbico, velocidad, método intenso). Es válido como decisión tuya; NEXIA evaluará cada cualidad por separado cuando haya datos — no un score único de «anaeróbico».",
    },
    {
        id: "mobility_stability",
        slugs: ["movilidad", "estabilidad"],
        minActive: 2,
        title: "ROM y control motor",
        body: "Movilidad (rango articular) y estabilidad (control motor) suelen coexistir pero no miden lo mismo. El mix expresa prioridades relativas, no un índice combinado.",
    },
    {
        id: "balance_coordination",
        slugs: ["equilibrio", "coordinacion"],
        minActive: 2,
        title: "Habilidades motoras distintas",
        body: "Ambas son habilidades dependientes de la tarea. NEXIA no genera una puntuación global de control motor desde este reparto.",
    },
];

function slugSetFromQualities(
    qualities: readonly PeriodBlockQualityInput[],
    catalog: readonly PhysicalQuality[],
): Set<string> {
    const idToSlug = new Map(catalog.map((c) => [c.id, c.slug]));
    const active = new Set<string>();
    for (const q of qualities) {
        if (q.percentage <= 0) continue;
        const slug = idToSlug.get(q.physical_quality_id);
        if (slug) active.add(slug);
    }
    return active;
}

export function getQualityTooltip(slug: string): string | undefined {
    return QUALITY_SLUG_TOOLTIPS[slug];
}

export function getCoPrimarySlugs(
    qualities: readonly PeriodBlockQualityInput[],
    catalog: readonly PhysicalQuality[],
): string[] {
    const active = qualities.filter((q) => q.percentage > 0);
    if (active.length === 0) return [];
    const maxPct = Math.max(...active.map((q) => q.percentage));
    const idToSlug = new Map(catalog.map((c) => [c.id, c.slug]));
    return active
        .filter((q) => q.percentage === maxPct)
        .map((q) => idToSlug.get(q.physical_quality_id))
        .filter((s): s is string => Boolean(s));
}

export function isCoPrimaryMix(
    qualities: readonly PeriodBlockQualityInput[],
    catalog: readonly PhysicalQuality[],
): boolean {
    return getCoPrimarySlugs(qualities, catalog).length > 1;
}

export function detectAmbiguousMixWarnings(
    qualities: readonly PeriodBlockQualityInput[],
    catalog: readonly PhysicalQuality[],
): MixAmbiguityWarning[] {
    const activeSlugs = slugSetFromQualities(qualities, catalog);
    const warnings: MixAmbiguityWarning[] = [];
    const seen = new Set<string>();

    for (const rule of AMBIGUOUS_MIX_RULES) {
        const hitCount = rule.slugs.filter((s) => activeSlugs.has(s)).length;
        if (hitCount >= rule.minActive && !seen.has(rule.id)) {
            seen.add(rule.id);
            warnings.push({ id: rule.id, title: rule.title, body: rule.body });
        }
    }
    return warnings;
}

export function formatCoPrimaryLabels(
    slugs: readonly string[],
    catalog: readonly { slug: string; name: string }[],
): string {
    return slugs
        .map((slug) => catalog.find((c) => c.slug === slug)?.name ?? slug)
        .join(" · ");
}
