/**
 * AthleteExerciseInjuryAlert.tsx — Callout conflicto ejercicio↔lesión (F3b-FE-01).
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import type { InjuryAlert } from "@nexia/shared/types/injuryAlert";
import {
    buildInjuryConflictMessage,
    buildInjuryConflictMessageShort,
    injuryAlertIsDanger,
} from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";
import { AthleteInjuryCallout } from "@/components/athlete/AthleteInjuryCallout";

export interface AthleteExerciseInjuryAlertProps {
    exerciseName: string;
    alert: InjuryAlert;
    onConsultTrainer?: () => void;
    /** Móvil: callout de una línea bajo el ejercicio */
    compact?: boolean;
    /** Override del mensaje (p. ej. resumen preview) */
    message?: string;
}

export const AthleteExerciseInjuryAlert: React.FC<AthleteExerciseInjuryAlertProps> = ({
    exerciseName,
    alert,
    onConsultTrainer,
    compact = false,
    message,
}) => {
    const isDanger = injuryAlertIsDanger(alert);
    const displayMessage =
        message ?? (compact ? buildInjuryConflictMessageShort(alert) : buildInjuryConflictMessage(alert));

    if (compact) {
        return (
            <AthleteInjuryCallout
                message={displayMessage}
                isDanger={isDanger}
                onConsult={onConsultTrainer}
            />
        );
    }

    return (
        <Alert variant={isDanger ? "error" : "warning"}>
            <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium">
                        {isDanger ? "Precaución con este ejercicio" : "Ten en cuenta tu lesión"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{exerciseName}</span>
                        {" — "}
                        {displayMessage}
                    </p>
                    {onConsultTrainer && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="min-h-touch-athlete"
                            onClick={onConsultTrainer}
                        >
                            Habla con tu entrenador
                        </Button>
                    )}
                </div>
            </div>
        </Alert>
    );
};
