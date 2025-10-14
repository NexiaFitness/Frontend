/**
 * useEmailVerificationModal - Lógica para verificación de email
 *
 * Contexto:
 * - Reenvío de email de verificación
 * - Verificación de estado actual (refresh)
 * - Cross-platform ready
 *
 * @author Frontend Team
 * @since v4.4.0
 */

import { useState } from 'react';
import { useResendVerificationMutation, useGetCurrentUserQuery } from '../../api/authApi';

interface EmailVerificationModalResult {
    resendEmail: () => Promise<void>;
    checkVerification: () => Promise<boolean>;
    isResending: boolean;
    isChecking: boolean;
    error: string | null;
}

export function useEmailVerificationModal(
    email: string
): EmailVerificationModalResult {
    const [resendVerification, { isLoading: isResending }] =
        useResendVerificationMutation();
    const { refetch, isLoading: isChecking } = useGetCurrentUserQuery();

    const [error, setError] = useState<string | null>(null);

    const resendEmail = async () => {
        try {
            setError(null);
            await resendVerification({ email }).unwrap();
        } catch (err: any) {
            setError(err?.data?.detail || 'Error al reenviar email');
            throw err;
        }
    };

    const checkVerification = async (): Promise<boolean> => {
        try {
            setError(null);
            const result = await refetch();
            return result.data?.is_verified || false;
        } catch (err: any) {
            setError(err?.data?.detail || 'Error al verificar estado');
            return false;
        }
    };

    return {
        resendEmail,
        checkVerification,
        isResending,
        isChecking,
        error,
    };
}