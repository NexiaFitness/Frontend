/**
 * useEmailVerificationGuard.ts — Hook para validar verificación de email
 *
 * Contexto:
 * - Verifica si user.is_verified === true
 * - Bloquea acciones críticas (crear clientes) si email no verificado
 * - Patrón similar a useCompleteProfileModal
 * - Cross-platform ready (sin dependencias de navegación)
 *
 * Uso:
 * const { shouldBlockForEmail } = useEmailVerificationGuard();
 * if (shouldBlockForEmail) { showModal(); return; }
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";

interface EmailVerificationGuardResult {
    shouldBlockForEmail: boolean;
    isEmailVerified: boolean;
    userEmail: string;
}

export function useEmailVerificationGuard(): EmailVerificationGuardResult {
    const { user } = useSelector((state: RootState) => state.auth);

    const isEmailVerified = user?.is_verified ?? false;
    const shouldBlockForEmail = !isEmailVerified;
    const userEmail = user?.email ?? "";

    return {
        shouldBlockForEmail,
        isEmailVerified,
        userEmail,
    };
}