/**
 * AthleteInjuriesBanner.tsx — Banner lesiones V04 + conflictos check-alert (F3b-FE-01).
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
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
        <Alert variant={conflictCount > 0 ? "warning" : "warning"}>
            <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1">
                        <p className="font-medium">Limitaciones registradas</p>
                        <p className="text-sm text-muted-foreground">
                            Si sientes dolor, para y avisa a tu entrenador.
                        </p>
                        {isCheckingConflicts && (
                            <p className="text-caption text-muted-foreground">
                                Revisando ejercicios de la sesión…
                            </p>
                        )}
                        {!isCheckingConflicts && conflictCount > 0 && (
                            <p className="text-sm font-medium text-warning">
                                {conflictCount === 1
                                    ? "1 ejercicio de esta sesión puede afectar tu lesión."
                                    : `${conflictCount} ejercicios de esta sesión pueden afectar tu lesión.`}
                            </p>
                        )}
                    </div>

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

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-touch-athlete"
                        onClick={onConsultTrainer}
                    >
                        Consultar
                    </Button>
                </div>
            </div>
        </Alert>
    );
};
