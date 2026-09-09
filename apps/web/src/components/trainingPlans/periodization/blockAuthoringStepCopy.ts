/**
 * blockAuthoringStepCopy.ts — Título e instrucción canónicos por paso del wizard D-PAP.
 */

import type { BlockAuthorStep } from "./blockAuthoringModel";
import { PHYSICAL_QUALITY_MIX_COPY } from "./periodizationQualitiesPresentation";
import { periodUnitPhrase } from "./phaseAuthoringPresentation";

export interface BlockAuthoringStepCopy {
    title: string;
    hint: string;
}

export function getBlockAuthoringStepCopy(
    step: BlockAuthorStep,
    periodUnit: "fase" | "bloque" = "fase",
): BlockAuthoringStepCopy {
    const periodLabel = periodUnitPhrase(periodUnit);

    switch (step) {
        case "qualities":
            return {
                title: "¿Qué cualidades físicas trabajará este bloque?",
                hint: PHYSICAL_QUALITY_MIX_COPY.helpParagraph,
            };
        case "volumeIntensity":
            return {
                title: "¿Cómo calibrar volumen e intensidad?",
                hint: "Ajusta la carga global del bloque. NEXIA usará estos niveles como referencia al programar sesiones y analizar la periodización.",
            };
        case "days":
            return {
                title: "¿Qué días entrena en este bloque?",
                hint: `Define la regla recurrente para todas las semanas de ${periodLabel}. No modifica el perfil del cliente.`,
            };
        case "patterns":
            return {
                title: "¿Qué patrones de movimiento por día?",
                hint: `Asigna manualmente los patrones a cada día activo. La configuración se aplicará a todas las semanas de ${periodLabel}.`,
            };
        case "summary":
            return {
                title: "Revisa el bloque antes de guardar",
                hint: "Comprueba fechas, cualidades, carga, días y patrones. Puedes volver a cualquier paso para ajustar detalles.",
            };
        default:
            return { title: "", hint: "" };
    }
}
