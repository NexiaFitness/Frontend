/**
 * LogoutConfirmationModal.tsx — Modal de confirmación de logout profesional.
 *
 * Contexto:
 * - Usa BaseModal responsive (mobile + desktop).
 * - Botones con ancho igual en desktop (md:flex-1).
 * - Spinner gestionado por Button base.
 *
 * Notas de mantenimiento:
 * - Accesibilidad: delegada a BaseModal (title + description).
 * - Comportamiento: confirma o cancela logout sin fricción.
 *
 * @author Nelson
 * @since v4.2.0
 * @updated v4.3.6 - Botones responsive unificados + spinner en Button
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    userName?: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    isLoading = false,
    userName,
}) => {
    const description = userName
        ? `¿Seguro que quieres cerrar sesión, ${userName}?`
        : "¿Seguro que deseas cerrar sesión?";

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onCancel}
            title="¿Cerrar sesión?"
            description={description}
            iconType="warning"
            isLoading={isLoading}
            autoFocus={false} // Logout no es crítico → sin auto-focus
        >
            {/* Action buttons - Mobile: stacked, Desktop: side by side with equal width */}
            <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    size="md"
                    className="w-full md:flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="md"
                    className="w-full md:flex-1"
                >
                    Cerrar sesión
                </Button>
            </div>
        </BaseModal>
    );
};
