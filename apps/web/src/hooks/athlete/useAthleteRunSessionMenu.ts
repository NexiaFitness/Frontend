/**
 * useAthleteRunSessionMenu.ts — Menú ⋯ en /run: registro manual y terminar sesión (FE-5).
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAthleteRunForceFinish } from "@/hooks/athlete/useAthleteRunForceFinish";

export interface UseAthleteRunSessionMenuOptions {
    sessionId: number;
    isOnline: boolean;
    syncPendingCount: number;
    progressPendingStepCount: number;
    finishSession: () => Promise<"synced" | "queued" | "offline">;
    onFinishNavigate?: (result: "synced" | "offline" | "queued") => void;
    onError?: (message: string) => void;
}

export function useAthleteRunSessionMenu({
    sessionId,
    isOnline,
    syncPendingCount,
    progressPendingStepCount,
    finishSession,
    onFinishNavigate,
    onError,
}: UseAthleteRunSessionMenuOptions) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false);

    const { forceFinishSession, isFinishing } = useAthleteRunForceFinish({
        sessionId,
        isOnline,
        syncPendingCount,
        finishSession,
        onError,
    });

    const exitToSessionPreview = useCallback(() => {
        navigate(`/dashboard/sessions/${sessionId}`);
    }, [navigate, sessionId]);

    const switchToManualLog = useCallback(() => {
        setMenuOpen(false);
        navigate(`/dashboard/sessions/${sessionId}?mode=log`);
    }, [navigate, sessionId]);

    const completeAndLeave = useCallback(async () => {
        const ok = await forceFinishSession();
        if (!ok) return false;
        setTerminateConfirmOpen(false);
        setMenuOpen(false);
        const result = isOnline ? "synced" : "offline";
        onFinishNavigate?.(result);
        if (result === "synced") {
            navigate(`/dashboard/sessions/${sessionId}/feedback?from=finish`);
        } else {
            navigate("/dashboard/sessions");
        }
        return true;
    }, [forceFinishSession, isOnline, navigate, onFinishNavigate, sessionId]);

    const requestTerminateSession = useCallback(() => {
        setMenuOpen(false);
        if (progressPendingStepCount > 0) {
            setTerminateConfirmOpen(true);
            return;
        }
        void completeAndLeave();
    }, [completeAndLeave, progressPendingStepCount]);

    return {
        menuOpen,
        setMenuOpen,
        terminateConfirmOpen,
        setTerminateConfirmOpen,
        exitToSessionPreview,
        switchToManualLog,
        requestTerminateSession,
        confirmTerminateSession: completeAndLeave,
        isFinishing,
        pendingStepCount: progressPendingStepCount,
    };
}
