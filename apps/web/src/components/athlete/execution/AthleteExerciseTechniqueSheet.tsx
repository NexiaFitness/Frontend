/**
 * AthleteExerciseTechniqueSheet.tsx — Vídeo / fotos / instrucciones (F3e stub V05).
 */

import React from "react";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { Button } from "@/components/ui/buttons";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { ATHLETE_RUN_INSTRUCTION } from "./athleteRunPresentation";
import type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";

export type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";

export interface AthleteExerciseTechniqueSheetProps {
    target: AthleteExerciseTechniqueTarget | null;
    onClose: () => void;
}

export const AthleteExerciseTechniqueSheet: React.FC<AthleteExerciseTechniqueSheetProps> = ({
    target,
    onClose,
}) => {
    const isOpen = target != null;
    const hasVideo = Boolean(target?.videoUrl?.trim());
    const hasInstruction = Boolean(target?.instruction?.trim());

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={target?.exerciseName ?? "Técnica"}
            subtitle="Demostración del ejercicio"
            footer={
                <Button variant="primary" className={ATHLETE_PRIMARY_CTA} onClick={onClose}>
                    Cerrar
                </Button>
            }
        >
            <div className="space-y-4">
                {hasVideo ? (
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-black/40">
                        <video
                            src={target!.videoUrl!}
                            controls
                            playsInline
                            className="aspect-video w-full object-contain"
                        />
                    </div>
                ) : null}

                {hasInstruction ? (
                    <p className={ATHLETE_RUN_INSTRUCTION}>{target!.instruction}</p>
                ) : null}

                {!hasVideo && !hasInstruction ? (
                    <p className="text-sm text-muted-foreground">
                        El contenido demostrativo de este ejercicio estará disponible pronto en el
                        catálogo.
                    </p>
                ) : null}
            </div>
        </BottomSheet>
    );
};
