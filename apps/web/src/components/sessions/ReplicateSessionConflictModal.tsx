/**
 * ReplicateSessionConflictModal — Conflictos al replicar sesión (NexiaPremiumModal).
 */

import React from "react";
import { TriangleAlert } from "lucide-react";

import type { SkippedConflictItem } from "@nexia/shared/types/trainingSessions";

import { Button } from "@/components/ui/buttons";
import {
    NexiaPremiumModal,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS,
} from "@/components/ui/modals";
import { cn } from "@/lib/utils";

interface ReplicateSessionConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmReplace: () => void;
    conflicts: SkippedConflictItem[];
    createdCount: number;
    isLoading: boolean;
}

export const ReplicateSessionConflictModal: React.FC<
    ReplicateSessionConflictModalProps
> = ({ isOpen, onClose, onConfirmReplace, conflicts, createdCount, isLoading }) => (
    <NexiaPremiumModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="lg"
        closeOnBackdrop={!isLoading}
        closeOnEsc={!isLoading}
        title="Sesiones con conflicto"
        description={`Se replicaron ${createdCount} sesiones correctamente. Algunas semanas destino ya tienen una sesión activa:`}
        footer={
            <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                <div className={NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Mantener existentes
                    </Button>
                    <Button
                        type="button"
                        variant="outline-destructive"
                        onClick={onConfirmReplace}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className={cn("flex-1 sm:flex-none")}
                    >
                        Reemplazar
                    </Button>
                </div>
            </div>
        }
    >
        <div className="space-y-4">
            <div className="space-y-2 rounded-lg border border-border/50 p-3">
                {conflicts.map((conflict, index) => (
                    <div
                        key={`${conflict.week_ordinal}-${index}`}
                        className="flex items-center gap-2 rounded-md bg-warning/5 px-2 py-1.5"
                    >
                        <TriangleAlert
                            className="h-4 w-4 shrink-0 text-warning"
                            aria-hidden
                        />
                        <span className="text-sm font-medium text-foreground">
                            Semana {conflict.week_ordinal}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {conflict.session_date}
                        </span>
                    </div>
                ))}
            </div>
            <p className="text-sm text-muted-foreground">
                Puedes mantener las sesiones existentes o reemplazarlas con la versión
                replicada.
            </p>
        </div>
    </NexiaPremiumModal>
);
