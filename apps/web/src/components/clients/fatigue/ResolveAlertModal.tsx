/**
 * ResolveAlertModal.tsx — Modal para resolver alerta de fatiga
 *
 * Contexto:
 * - Permite resolver una alerta con notas opcionales
 * - Usa BaseModal para consistencia visual y accesibilidad
 * - Integrado con useToast para feedback
 *
 * @author Frontend Team
 * @since v6.3.0 - Fase 3: Mejoras UX en resolución de alertas
 */

import React, { useState, useEffect, useCallback } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons/Button";
import { TYPOGRAPHY } from "@/utils/typography";

interface ResolveAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResolve: (resolutionNotes?: string) => Promise<void>;
    isResolving?: boolean;
    alertTitle?: string;
}

/**
 * Modal para resolver alerta de fatiga
 *
 * Permite al trainer agregar notas opcionales al resolver una alerta.
 * Usa BaseModal para consistencia con el resto de la aplicación.
 */
export const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({
    isOpen,
    onClose,
    onResolve,
    isResolving = false,
    alertTitle,
}) => {
    const [resolutionNotes, setResolutionNotes] = useState<string>("");

    /**
     * Resetear notas al cerrar modal
     */
    useEffect(() => {
        if (!isOpen) {
            setResolutionNotes("");
        }
    }, [isOpen]);

    /**
     * Handler para resolver alerta
     */
    const handleResolve = useCallback(async () => {
        try {
            await onResolve(resolutionNotes.trim() || undefined);
            onClose();
        } catch (error) {
            console.error("[ResolveAlertModal] Error resolving alert:", error);
            // El error se maneja en el componente padre con toast
        }
    }, [onResolve, onClose, resolutionNotes]);

    /**
     * Handler para Enter en textarea (Ctrl+Enter para submit)
     */
    const handleTextareaKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isResolving) {
                e.preventDefault();
                handleResolve();
            }
        },
        [handleResolve, isResolving]
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Resolver Alerta"
            description={
                alertTitle
                    ? `¿Resolver la alerta "${alertTitle}"?`
                    : "¿Resolver esta alerta? La alerta se moverá al historial."
            }
            iconType="success"
            closeOnBackdrop={!isResolving}
            closeOnEsc={!isResolving}
            isLoading={isResolving}
        >
            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="resolution-notes"
                        className={`${TYPOGRAPHY.inputLabel} block mb-2`}
                    >
                        Notas de resolución (opcional)
                    </label>
                    <textarea
                        id="resolution-notes"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        rows={4}
                        placeholder="Agrega notas sobre cómo se resolvió esta alerta..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={isResolving}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Presiona Ctrl+Enter para resolver rápidamente
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isResolving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleResolve}
                        disabled={isResolving}
                        isLoading={isResolving}
                    >
                        {isResolving ? "Resolviendo..." : "Resolver"}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};

