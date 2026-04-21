/**
 * CompleteProfileModal - Modal que bloquea creación de clientes si perfil incompleto
 *
 * Contexto:
 * - Aparece cuando trainer intenta crear su primer cliente
 * - Muestra campos faltantes del perfil profesional
 * - Redirige a /dashboard/trainer/complete-profile
 *
 * Trigger: Click en "Add New Client" en TrainerDashboard
 *
 * @author Frontend Team
 * @since v4.4.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseModal } from '@/components/ui/modals';
import { Button } from '@/components/ui/buttons';
import { useCompleteProfileModal } from '@nexia/shared';

interface CompleteProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
    isOpen,
    onClose,
}) => {
    const navigate = useNavigate();
    const { missingFieldsLabels } = useCompleteProfileModal();

    const handleComplete = () => {
        navigate('/dashboard/trainer/complete-profile');
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Completa tu perfil profesional"
            description="Para crear clientes necesitas completar tu perfil con los siguientes datos:"
            iconType="warning"
            titleId="complete-profile-modal-title"
            descriptionId="complete-profile-modal-description"
        >
            {/* Lista de campos faltantes */}
            <div className="mb-6 sm:mb-8">
                <ul className="space-y-2 text-left">
                    {missingFieldsLabels.map((label: string) => (
                        <li
                            key={label}
                            className="flex items-center text-sm text-foreground sm:text-base"
                        >
                            <span className="mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning text-xs font-bold">
                                +
                            </span>
                            {label}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Info adicional */}
            <div className="mb-6 rounded-lg border border-warning/20 bg-warning/10 p-4 sm:mb-8">
                <p className="text-sm text-warning">
                    Completar tu perfil te tomará solo 2 minutos.
                </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="primary"
                    size="md"
                    onClick={handleComplete}
                    className="w-full sm:w-1/2"
                >
                    Completar ahora
                </Button>
                <Button
                    variant="outline"
                    size="md"
                    onClick={onClose}
                    className="w-full sm:w-1/2"
                >
                    Cancelar
                </Button>
            </div>
        </BaseModal>
    );
};