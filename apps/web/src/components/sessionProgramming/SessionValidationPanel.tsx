/**
 * SessionValidationPanel.tsx — Panel lateral de validación automática de sesión
 *
 * Contexto:
 * - Fase 7 de SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 * - Se abre automáticamente tras guardar una sesión en CreateSession / EditSession.
 * - Muestra comparación de la sesión contra su bloque de periodización.
 *
 * Responsabilidades:
 * - Disparar validación vía RTK Query cuando se abre con un trainingSessionId.
 * - Renderizar contenido vía SessionValidationContent.
 * - No bloquear navegación; el entrenador puede cerrar y continuar.
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 7 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 * @updated v6.5.0 — Extraído contenido a SessionValidationContent para reutilizar en review page.
 */

import React, { useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";

import { useValidateSessionMutation } from "@nexia/shared/api/sessionValidationApi";

import { SidePanel } from "@/components/ui/layout/SidePanel";
import { Button } from "@/components/ui/buttons";
import { SessionValidationContent } from "./SessionValidationContent";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SessionValidationPanelProps {
    trainingSessionId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onContinue?: () => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const SessionValidationPanel: React.FC<SessionValidationPanelProps> = ({
    trainingSessionId,
    isOpen,
    onClose,
    onEdit,
    onContinue,
}) => {
    const [validateSession, { isLoading, data, error }] = useValidateSessionMutation();

    useEffect(() => {
        if (isOpen && trainingSessionId != null && trainingSessionId > 0) {
            validateSession({ trainingSessionId });
        }
    }, [isOpen, trainingSessionId, validateSession]);

    return (
        <SidePanel isOpen={isOpen} onClose={onClose} ariaLabel="Panel de validación de sesión">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">Validación de sesión</h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    aria-label="Cerrar panel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <SessionValidationContent data={data ?? null} isLoading={isLoading} error={error ?? null} />
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 space-y-2">
                {onEdit && (
                    <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver a editar la sesión
                    </Button>
                )}
                {onContinue && (
                    <Button variant="primary" size="sm" className="w-full" onClick={onContinue}>
                        Continuar
                    </Button>
                )}
                {!onContinue && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
                        Cerrar
                    </Button>
                )}
            </div>
        </SidePanel>
    );
};
