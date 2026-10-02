/**
 * AthleteInjuriesBanner.tsx — Banner lesiones V04 + conflictos check-alert (F3b-FE-01).
 *
 * Contexto: preview sesión atleta. Usa Alert unificado (DESIGN_PREMIUM.md §5.2)
 * sin icono Lucide duplicado.
 *
 * @author Frontend Team
 * @since v9.0.0
 * @updated v9.2.0 — API title/description/action
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import type { ExerciseInjuryConflict } from "@nexia/shared/types/injuryAlert";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";

export interface AthleteInjuriesBannerProps {
    injuries: InjuryWithDetails[];
    conflicts?: ExerciseInjuryConflict[];
    isCheckingConflicts?: boolean;
    onConsultTrainer: () => void;
}

function injuryLabel(injury: InjuryWithDetails): string {
    const joint = injury.joint_name_es ?? injury.joint_name ?? "Articulación";
    const movement = injury.movement_name_es ?? injury.movement_name;
    return movement ? `${joint} · ${movement}` : joint;
}

export const AthleteInjuriesBanner: React.FC<AthleteInjuriesBannerProps> = ({
    injuries,
    conflicts = [],
    isCheckingConflicts = false,
    onConsultTrainer,
}) => {
    if (injuries.length === 0) {
        return null;
    }

    const conflictCount = conflicts.length;

    return (
        <Alert
            variant="warning"
            title="Limitaciones registradas"
            description={
                <div className="space-y-3">
                    <p>Si sientes dolor, para y avisa a tu entrenador.</p>
                    {isCheckingConflicts ? (
                        <p className="text-caption text-muted-foreground">
                            Revisando ejercicios de la sesión…
                        </p>
                    ) : null}
                    {!isCheckingConflicts && conflictCount > 0 ? (
                        <p className="text-sm font-medium text-warning">
                            {conflictCount === 1
                                ? "1 ejercicio de esta sesión puede afectar tu lesión."
                                : `${conflictCount} ejercicios de esta sesión pueden afectar tu lesión.`}
                        </p>
                    ) : null}
                    <ul className="space-y-1 text-sm">
                        {injuries.map((injury) => (
                            <li key={injury.id} className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">
                                    {injuryLabel(injury)}
                                </span>
                                <span className="text-caption text-muted-foreground">
                                    Dolor {injury.pain_level}/5
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            }
            action={
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className="min-h-touch-athlete"
                    onClick={onConsultTrainer}
                >
                    Consultar
                </Button>
            }
        />
    );
};
