/**
 * useAthleteRunForceFinish.ts — Terminar sesión desde guiado (FE-5), paridad forceComplete FE-3.
 */

import { useCallback, useState } from "react";
import { useUpdateTrainingSessionMutation } from "@nexia/shared/api/trainingSessionsApi";

export interface UseAthleteRunForceFinishOptions {
    sessionId: number;
    isOnline: boolean;
    syncPendingCount: number;
    finishSession: () => Promise<"synced" | "queued" | "offline">;
    onError?: (message: string) => void;
}

export function useAthleteRunForceFinish({
    sessionId,
    isOnline,
    syncPendingCount,
    finishSession,
    onError,
}: UseAthleteRunForceFinishOptions) {
    const [updateSession] = useUpdateTrainingSessionMutation();
    const [isFinishing, setIsFinishing] = useState(false);

    const forceFinishSession = useCallback(async (): Promise<boolean> => {
        if (syncPendingCount > 0) {
            onError?.(
                "Hay datos guardados en el móvil sin enviar. Conéctate y espera la sincronización."
            );
            return false;
        }
        setIsFinishing(true);
        try {
            if (isOnline) {
                await updateSession({ id: sessionId, body: { status: "completed" } }).unwrap();
            } else {
                await finishSession();
            }
            return true;
        } catch {
            onError?.("No se pudo cerrar la sesión. Revisa la conexión e inténtalo de nuevo.");
            return false;
        } finally {
            setIsFinishing(false);
        }
    }, [finishSession, isOnline, onError, sessionId, syncPendingCount, updateSession]);

    return { forceFinishSession, isFinishing };
}
