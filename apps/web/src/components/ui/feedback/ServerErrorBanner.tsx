/**
 * ServerErrorBanner.tsx — Errores de formulario/servidor sobre Alert unificado.
 *
 * Contexto: auth, account y sheets. Antes usaba bg-red-50 (legacy); ahora
 * delega en Alert variant=error (DESIGN_PREMIUM.md §3, §5.2).
 *
 * Notas de mantenimiento: API estable (error + onDismiss). Preferir Alert
 * directo en código nuevo.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v9.2.0 — Alert error
 */

import React from "react";
import { Alert } from "./Alert";

interface ServerErrorBannerProps {
    error?: string | null;
    onDismiss?: () => void;
}

export const ServerErrorBanner: React.FC<ServerErrorBannerProps> = ({
    error,
    onDismiss,
}) => {
    if (error == null || error.trim() === "") {
        return null;
    }

    return (
        <Alert
            variant="error"
            title={error}
            onDismiss={onDismiss}
            data-testid="server-error-banner"
        />
    );
};
