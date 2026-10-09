/**
 * AthletePlanActiveHero.tsx — Bloque activo mes/semana + anillos (V08).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteProgressRing } from "@/components/athlete/AthleteProgressRing";
import type { AthletePlanActiveBlockCopy } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import { formatAthletePercent } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import { ATHLETE_PLAN_HERO } from "./athletePlanPresentation";
import { AthletePlanLoadBar } from "./AthletePlanLoadBar";

export interface AthletePlanActiveHeroProps {
    active: AthletePlanActiveBlockCopy;
    sessionsCompleted: number;
    sessionsPlanned: number;
}

function PlanRingMetric({
    label,
    progress,
    displayValue,
    ariaLabel,
    tone = "primary",
}: {
    label: string;
    progress: number;
    displayValue: string;
    ariaLabel: string;
    tone?: "primary" | "success";
}) {
    return (
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <AthleteProgressRing
                progress={progress}
                displayValue={displayValue}
                ariaLabel={ariaLabel}
                tone={tone}
                size="lg"
            />
            <p className="text-center text-[11px] font-medium text-muted-foreground">{label}</p>
        </div>
    );
}

export const AthletePlanActiveHero: React.FC<AthletePlanActiveHeroProps> = ({
    active,
    sessionsCompleted,
    sessionsPlanned,
}) => {
    const adherenceDisplay = formatAthletePercent(active.adherencePercent);
    const coherenceDisplay =
        active.coherencePercent != null ? formatAthletePercent(active.coherencePercent) : "—";
    const coherenceProgress =
        active.coherencePercent != null ? active.coherencePercent / 100 : 0;

    return (
        <section className={ATHLETE_PLAN_HERO} aria-label="Bloque activo del plan">
            <NexiaGlassAccentRim />

            <div className="relative space-y-1">
                <p className="text-sm font-semibold capitalize text-foreground">{active.monthLabel}</p>
                {active.weekLabel && (
                    <p className="text-xs text-muted-foreground">{active.weekLabel}</p>
                )}
            </div>

            <div className="relative flex items-start justify-around gap-3">
                <PlanRingMetric
                    label="Adherencia"
                    progress={active.adherencePercent / 100}
                    displayValue={adherenceDisplay}
                    ariaLabel={`Adherencia: ${adherenceDisplay}`}
                    tone="success"
                />
                <PlanRingMetric
                    label="Coherencia"
                    progress={coherenceProgress}
                    displayValue={coherenceDisplay}
                    ariaLabel={`Coherencia: ${coherenceDisplay}`}
                />
            </div>

            <p className="relative text-center text-xs text-muted-foreground tabular-nums">
                {sessionsCompleted} / {sessionsPlanned} sesiones este año
            </p>

            <div className="relative space-y-3 border-t border-border/60 pt-4">
                <p className="text-xs text-muted-foreground">
                    Carga planificada de {active.monthLabel.toLowerCase()}:{" "}
                    <span className="text-foreground/90">volumen</span> (cuánto entrenas) e{" "}
                    <span className="text-foreground/90">intensidad</span> (qué tan duro), escala
                    1–10.
                </p>
                <AthletePlanLoadBar label="Volumen" level={active.volumeLevel} />
                <AthletePlanLoadBar
                    label="Intensidad"
                    level={active.intensityLevel}
                    tone="warning"
                />
            </div>
        </section>
    );
};
