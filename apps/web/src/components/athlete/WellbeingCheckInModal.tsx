/**
 * WellbeingCheckInModal.tsx — Check-in pre-sesión atleta (F2).
 * Escala 1–3: Bajo / Normal / Alto → FatigueAnalysis.pre_fatigue_level
 */

import React, { useState } from "react";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { WellbeingLevel } from "@/hooks/athlete/useWellbeingCheckIn";

const OPTIONS: { level: WellbeingLevel; label: string; hint: string }[] = [
    { level: 1, label: "Bajo", hint: "Llego cansado o con poca energía" },
    { level: 2, label: "Normal", hint: "Me siento bien para entrenar" },
    { level: 3, label: "Alto", hint: "Con buena energía hoy" },
];

interface WellbeingCheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (level: WellbeingLevel) => Promise<void>;
    isSubmitting?: boolean;
}

export const WellbeingCheckInModal: React.FC<WellbeingCheckInModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
}) => {
    const [selected, setSelected] = useState<WellbeingLevel | null>(null);

    const handleConfirm = async () => {
        if (!selected) return;
        await onSubmit(selected);
        setSelected(null);
    };

    const handleClose = () => {
        setSelected(null);
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="¿Cómo llegas hoy?"
            description="Tu entrenador lo verá antes de la sesión. Solo tarda un segundo."
            maxWidth="md"
            closeOnBackdrop={!isSubmitting}
            closeOnEsc={!isSubmitting}
            isLoading={isSubmitting}
        >
            <div className="space-y-4">
                <div className="grid gap-2">
                    {OPTIONS.map(({ level, label, hint }) => (
                        <button
                            key={level}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setSelected(level)}
                            className={cn(
                                "rounded-lg border px-4 py-3 text-left transition-colors min-h-touch-athlete",
                                selected === level
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-card text-foreground hover:border-primary/50"
                            )}
                        >
                            <span className="block text-sm font-semibold">{label}</span>
                            <span className="mt-0.5 block text-caption text-muted-foreground">
                                {hint}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="secondary"
                        className="min-h-touch-athlete w-full sm:w-auto"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        className="min-h-touch-athlete w-full sm:w-auto"
                        onClick={handleConfirm}
                        disabled={!selected || isSubmitting}
                        isLoading={isSubmitting}
                    >
                        Empezar entrenamiento
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
