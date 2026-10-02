/**
 * AthleteExerciseInjuryAlert.tsx — Callout conflicto ejercicio↔lesión (F3b-FE-01).
 *
 * Contexto: preview/run atleta. Compact = AthleteInjuryCallout (Alert compact);
 * expandido = Alert unificado sin icono duplicado.
 *
 * @author Frontend Team
 * @since v9.0.0
 * @updated v9.2.0 — sin AlertTriangle duplicado
 */

import React from "react";
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
        <Alert
            variant={isDanger ? "error" : "warning"}
            title={isDanger ? "Precaución con este ejercicio" : "Ten en cuenta tu lesión"}
            description={
                <>
                    <span className="font-medium text-foreground">{exerciseName}</span>
                    {" — "}
                    {displayMessage}
                </>
            }
            action={
                onConsultTrainer ? (
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        className="min-h-touch-athlete"
                        onClick={onConsultTrainer}
                    >
                        Habla con tu entrenador
                    </Button>
                ) : undefined
            }
        />
    );
};
