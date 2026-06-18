/**
 * AthleteInjuryConsultSheet.tsx — Sheet consulta lesión (V04 preview + ContextStrip).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { ATHLETE_SETTINGS_CARD } from "@/components/athlete/account/athleteSettingsPresentation";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";

export interface AthleteInjuryConsultSheetProps {
    isOpen: boolean;
    onClose: () => void;
    injuries: InjuryWithDetails[];
}

function injuryLabel(injury: InjuryWithDetails): string {
    const joint = injury.joint_name_es ?? injury.joint_name ?? "Articulación";
    const movement = injury.movement_name_es ?? injury.movement_name;
    return movement ? `${joint} · ${movement}` : joint;
}

export const AthleteInjuryConsultSheet: React.FC<AthleteInjuryConsultSheetProps> = ({
    isOpen,
    onClose,
    injuries,
}) => {
    const navigate = useNavigate();

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Limitaciones activas"
            footer={
                <Button
                    variant="primary"
                    className="min-h-touch-athlete w-full"
                    onClick={() => {
                        onClose();
                        navigate("/dashboard/feedback");
                    }}
                >
                    Habla con tu entrenador
                </Button>
            }
        >
            <p className="text-sm text-muted-foreground">
                Ten en cuenta estas limitaciones al entrenar. Si sientes dolor, para y avisa a tu
                entrenador.
            </p>
            <ul className="mt-4 space-y-3">
                {injuries.map((injury) => (
                    <li key={injury.id} className={`${ATHLETE_SETTINGS_CARD} p-4`}>
                        <p className="font-medium text-foreground">{injuryLabel(injury)}</p>
                        <p className="mt-1 text-caption text-muted-foreground">
                            Dolor {injury.pain_level}/5
                        </p>
                    </li>
                ))}
            </ul>
        </BottomSheet>
    );
};
