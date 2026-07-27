/**
 * PlanificarClientChoiceModal — Fork cuando el cliente no tiene plan activo.
 * Unifica «Planificar» en una decisión clara: plantilla vs plan personalizado.
 */

import React from "react";
import { LayoutTemplate, PenLine } from "lucide-react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { TEMPLATE_TEMPORAL_BRIDGE_COPY } from "@nexia/shared";

export interface PlanificarClientChoiceModalProps {
    open: boolean;
    onClose: () => void;
    clientName?: string;
    onUseTemplate: () => void;
    onCreateCustomPlan: () => void;
}

export const PlanificarClientChoiceModal: React.FC<PlanificarClientChoiceModalProps> = ({
    open,
    onClose,
    clientName,
    onUseTemplate,
    onCreateCustomPlan,
}) => {
    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Planificar entrenamiento"
            description={
                clientName
                    ? `Elige cómo empezar el plan de ${clientName}`
                    : "Elige cómo empezar el plan de este cliente"
            }
            closeOnBackdrop
            closeOnEsc
        >
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{TEMPLATE_TEMPORAL_BRIDGE_COPY}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onUseTemplate();
                        }}
                        className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <LayoutTemplate className="h-5 w-5 text-primary" aria-hidden />
                        <span className="font-medium text-foreground">Usar plantilla</span>
                        <span className="text-sm text-muted-foreground">
                            Programa ya armado en biblioteca. Solo eliges inicio en calendario.
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onCreateCustomPlan();
                        }}
                        className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <PenLine className="h-5 w-5 text-primary" aria-hidden />
                        <span className="font-medium text-foreground">Plan personalizado</span>
                        <span className="text-sm text-muted-foreground">
                            Crear un plan desde cero con fechas concretas para este cliente.
                        </span>
                    </button>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
