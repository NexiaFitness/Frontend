/**
 * NotFound.tsx — Vista para rutas no definidas (404).
 *
 * Contexto: Ruta catch-all del router; se muestra cuando la URL no coincide con ninguna ruta.
 * Especificación: UX_UI_AUDIT_NEXIA_SPARKLE_FLOW.md — NotFound (*): flex centrado, bg-muted,
 * título "404", párrafo "Oops! Page not found", enlace "Return to Home" href="/".
 *
 * @author Frontend Team
 * @since v5.x
 * @updated Fase 8 - diseño según audit Sparkle
 */

import React from "react";

export const NotFound: React.FC = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground">404</h1>
                <p className="mt-2 text-xl text-muted-foreground">Oops! Page not found</p>
                <a
                    href="/"
                    className="mt-4 inline-block text-primary underline hover:text-primary/90"
                >
                    Return to Home
                </a>
            </div>
        </div>
    );
};
