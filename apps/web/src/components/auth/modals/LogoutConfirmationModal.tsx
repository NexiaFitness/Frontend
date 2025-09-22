/**
 * Modal de confirmación de logout profesional y limpio
 * Previene logouts accidentales sin sobreexplicar al usuario
 * 
 * RESPONSIVE: Usa BaseModal para comportamiento móvil optimizado
 *
 * @author Nelson
 * @since v4.2.0 - Refactored with BaseModal responsive
 */

import React from 'react';
import { Button } from '@/components/ui/buttons';
import { BaseModal } from '@/components/ui/modals';

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
        : '¿Seguro que deseas cerrar sesión?';

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onCancel}
            title="¿Cerrar sesión?"
            description={description}
            iconType="warning"
            isLoading={isLoading}
            autoFocus={false} // No auto-focus for logout (less critical)
        >
            {/* Action buttons - Mobile: stacked, Desktop: side by side */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 py-2.5 w-full sm:min-w-[160px] sm:w-auto order-2 sm:order-1"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="px-6 py-2.5 w-full sm:min-w-[160px] sm:w-auto order-1 sm:order-2"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Cerrando...
                        </div>
                    ) : (
                        'Cerrar Sesión'
                    )}
                </Button>
            </div>
        </BaseModal>
    );
};