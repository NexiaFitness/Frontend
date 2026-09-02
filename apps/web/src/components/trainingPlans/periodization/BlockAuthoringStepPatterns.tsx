/**
 * BlockAuthoringStepPatterns.tsx — Placeholder Fase 2; picker completo en Fase 3.
 */

import React from "react";

import { AUTHORING_PLACEHOLDER_CLASS, AUTHORING_STEP_META_CLASS } from "./phaseAuthoringPresentation";

interface Props {
    activeDayCount: number;
    configuredPatternDays: number;
}

export const BlockAuthoringStepPatterns: React.FC<Props> = ({
    activeDayCount,
    configuredPatternDays,
}) => (
    <div className="space-y-4">
        <p className={AUTHORING_STEP_META_CLASS}>Patrones por día</p>
        <p className="text-sm text-muted-foreground">
            {activeDayCount > 0
                ? `${configuredPatternDays} de ${activeDayCount} día(s) con patrones asignados.`
                : "Selecciona al menos un día en el paso anterior."}
        </p>
        <div className={AUTHORING_PLACEHOLDER_CLASS}>
            El picker premium de patrones (modal/sheet por día) se completa en Fase 3.
            Puedes avanzar al resumen para revisar el borrador.
        </div>
    </div>
);
