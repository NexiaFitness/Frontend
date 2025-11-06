/**
 * EmailVerificationModal - Modal para verificar email antes de emitir facturas
 *
 * Contexto:
 * - Aparece cuando trainer intenta emitir primera factura sin email verificado
 * - Permite reenviar email de verificación
 * - Permite verificar estado actual (refetch user)
 *
 * Trigger: Intento de emitir factura con !user.is_verified (FUTURO)
 *
 * @author Frontend Team
 * @since v4.4.0
 */

import React, { useState } from 'react';
import { BaseModal } from '@/components/ui/modals';
import { Button } from '@/components/ui/buttons';
import { useEmailVerificationModal } from '@nexia/shared';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerified?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
    isOpen,
    onClose,
    email,
    onVerified,
}) => {
    const { resendEmail, checkVerification, isResending, isChecking, error } =
        useEmailVerificationModal(email);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleResend = async () => {
        try {
            await resendEmail();
            setSuccessMessage('Email enviado correctamente. Revisa tu bandeja de entrada.');
        } catch {
            // Error handling in hook
        }
    };

    const handleCheckVerification = async () => {
        const isVerified = await checkVerification();
        if (isVerified) {
            setSuccessMessage('¡Email verificado correctamente!');
            setTimeout(() => {
                onVerified?.();
                onClose();
            }, 1500);
        } else {
            setSuccessMessage('Email aún no verificado. Revisa tu correo.');
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Verifica tu email"
            description="Para emitir facturas necesitas verificar tu dirección de email."
            iconType="info"
            titleId="email-verification-modal-title"
            descriptionId="email-verification-modal-description"
            isLoading={isResending || isChecking}
        >
            {/* Email actual */}
            <div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Email actual:</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                    {email}
                </p>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Info */}
            <div className="mb-6 sm:mb-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                    💡 Revisa tu bandeja de entrada y haz clic en el enlace de
                    verificación. Si no lo encuentras, revisa la carpeta de spam.
                </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="primary"
                    size="md"
                    onClick={handleResend}
                    isLoading={isResending}
                    disabled={isResending || isChecking}
                    className="w-full sm:w-1/2"
                >
                    Reenviar email
                </Button>
                <Button
                    variant="outline"
                    size="md"
                    onClick={handleCheckVerification}
                    isLoading={isChecking}
                    disabled={isResending || isChecking}
                    className="w-full sm:w-1/2"
                >
                    Ya verifiqué
                </Button>
            </div>

            {/* Link cambiar email */}
            <div className="mt-4 text-center">
                <a
                    href="/dashboard/account"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={onClose}
                >
                    Cambiar email →
                </a>
            </div>
        </BaseModal>
    );
};