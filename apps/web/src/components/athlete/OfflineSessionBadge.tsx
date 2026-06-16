/**
 * OfflineSessionBadge.tsx — Indicador de estado offline / sync pendiente (F1).
 */

import React from "react";
import { CloudOff, RefreshCw } from "lucide-react";

export interface OfflineSessionBadgeProps {
    isOnline: boolean;
    pendingCount: number;
}

export const OfflineSessionBadge: React.FC<OfflineSessionBadgeProps> = ({
    isOnline,
    pendingCount,
}) => {
    if (isOnline && pendingCount === 0) {
        return null;
    }

    const syncing = isOnline && pendingCount > 0;

    return (
        <div
            className="mb-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground"
            role="status"
        >
            {syncing ? (
                <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin text-warning" aria-hidden />
            ) : (
                <CloudOff className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            )}
            <div>
                {syncing ? (
                    <>
                        <p className="font-medium">Sincronizando…</p>
                        <p className="text-caption text-muted-foreground">
                            {pendingCount} cambio{pendingCount === 1 ? "" : "s"} pendiente
                            {pendingCount === 1 ? "" : "s"}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="font-medium">Sin conexión · Guardado localmente</p>
                        <p className="text-caption text-muted-foreground">
                            Tus series se sincronizarán al recuperar la red
                            {pendingCount > 0 ? ` (${pendingCount} pendientes)` : ""}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
