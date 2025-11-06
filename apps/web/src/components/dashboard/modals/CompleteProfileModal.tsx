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
                            className="flex items-center text-gray-700 text-sm sm:text-base"
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-3 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {label}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Info adicional */}
            <div className="mb-6 sm:mb-8 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                    ℹ️ Completar tu perfil te tomará solo 2 minutos.
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