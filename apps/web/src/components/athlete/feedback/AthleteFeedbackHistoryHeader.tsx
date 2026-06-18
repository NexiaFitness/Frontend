/**
 * AthleteFeedbackHistoryHeader.tsx — Cabecera premium historial notas (V12).
 */

import React from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_PAGE_HEADER_ICON,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";

export interface AthleteFeedbackHistoryHeaderProps {
    onBack: () => void;
}

export const AthleteFeedbackHistoryHeader: React.FC<AthleteFeedbackHistoryHeaderProps> = ({
    onBack,
}) => {
    return (
        <header className="space-y-4">
            <button
                type="button"
                onClick={onBack}
                className={ATHLETE_BACK_LINK}
            >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Volver
            </button>

            <div className="flex items-start gap-3">
                <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                    <MessageSquare className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Mis notas
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Feedback enviado y respuestas de tu entrenador
                    </p>
                </div>
            </div>

            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
