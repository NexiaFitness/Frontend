/**
 * WellbeingCheckInSheet.tsx — Check-in pre-sesión atleta premium (V04).
 * BottomSheet + glass cards; sustituye BaseModal centrado.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/buttons";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import type { WellbeingLevel } from "@/hooks/athlete/useWellbeingCheckIn";
import { WellbeingCheckInForm } from "./WellbeingCheckInForm";

export interface WellbeingCheckInSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (level: WellbeingLevel) => Promise<void>;
    isSubmitting?: boolean;
}

export const WellbeingCheckInSheet: React.FC<WellbeingCheckInSheetProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
}) => {
    const [selected, setSelected] = useState<WellbeingLevel | null>(null);

    const resetAndClose = () => {
        setSelected(null);
        onClose();
    };

    const handleDismiss = () => {
        if (isSubmitting) return;
        resetAndClose();
    };

    const handleConfirm = async () => {
        if (!selected) return;
        await onSubmit(selected);
        setSelected(null);
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={handleDismiss}
            title="¿Cómo llegas hoy?"
            subtitle="Tu entrenador lo verá antes de la sesión. Solo tarda un segundo."
            footer={
                <div className="flex flex-col gap-2">
                    <Button
                        variant="primary"
                        className={ATHLETE_PRIMARY_CTA}
                        onClick={() => void handleConfirm()}
                        disabled={!selected || isSubmitting}
                        isLoading={isSubmitting}
                    >
                        Empezar entrenamiento
                    </Button>
                    <Button
                        variant="ghost"
                        className="min-h-touch-athlete w-full text-muted-foreground"
                        onClick={handleDismiss}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                </div>
            }
        >
            <WellbeingCheckInForm
                selected={selected}
                onSelect={setSelected}
                disabled={isSubmitting}
            />
        </BottomSheet>
    );
};

/** @deprecated Usar WellbeingCheckInSheet — alias de compatibilidad. */
export const WellbeingCheckInModal = WellbeingCheckInSheet;
