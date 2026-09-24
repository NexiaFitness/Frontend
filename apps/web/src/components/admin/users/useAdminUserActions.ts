/**
 * useAdminUserActions.ts — Modales de soporte y mutaciones admin (U2).
 */

import { useCallback, useMemo, useState } from "react";
import {
    useActivateAdminUserMutation,
    useForceLogoutAdminUserMutation,
    useSuspendAdminUserMutation,
} from "@nexia/shared/api/adminUsersApi";
import type { AdminUserDetailOut } from "@nexia/shared/types/adminUsers";
import {
    suspendDisabledReason,
    validateAdminReason,
} from "@nexia/shared/utils/adminUsers/adminUserPermissions";

export type AdminUserReasonAction = "suspend" | "activate" | "force-logout";

export interface UseAdminUserActionsOptions {
    userId: number;
    currentUserId: number | undefined;
    userDetail: AdminUserDetailOut | undefined;
    activeAdminTotal: number | undefined;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export function useAdminUserActions(options: UseAdminUserActionsOptions) {
    const { userId, currentUserId, userDetail, activeAdminTotal, onSuccess, onError } = options;

    const [pendingAction, setPendingAction] = useState<AdminUserReasonAction | null>(null);
    const [reason, setReason] = useState("");

    const [suspendUser, suspendState] = useSuspendAdminUserMutation();
    const [activateUser, activateState] = useActivateAdminUserMutation();
    const [forceLogout, forceLogoutState] = useForceLogoutAdminUserMutation();

    const reasonError = useMemo(() => validateAdminReason(reason), [reason]);
    const canSubmitReason = reasonError == null;

    const suspendBlockReason = useMemo(
        () => suspendDisabledReason(currentUserId, userDetail, activeAdminTotal),
        [activeAdminTotal, currentUserId, userDetail]
    );

    const openAction = useCallback((action: AdminUserReasonAction) => {
        setReason("");
        setPendingAction(action);
    }, []);

    const closeAction = useCallback(() => {
        if (suspendState.isLoading || activateState.isLoading || forceLogoutState.isLoading) {
            return;
        }
        setPendingAction(null);
        setReason("");
    }, [activateState.isLoading, forceLogoutState.isLoading, suspendState.isLoading]);

    const isMutating = suspendState.isLoading || activateState.isLoading || forceLogoutState.isLoading;

    const submitReasonAction = useCallback(async () => {
        if (!pendingAction || !canSubmitReason) return;
        const body = { reason: reason.trim() };
        try {
            if (pendingAction === "suspend") {
                await suspendUser({ userId, body }).unwrap();
            } else if (pendingAction === "activate") {
                await activateUser({ userId, body }).unwrap();
            } else {
                await forceLogout({ userId, body }).unwrap();
            }
            onSuccess?.("Acción registrada correctamente.");
            closeAction();
        } catch {
            onError?.("No se pudo completar la acción.");
        }
    }, [
        activateUser,
        canSubmitReason,
        closeAction,
        forceLogout,
        onError,
        onSuccess,
        pendingAction,
        reason,
        suspendUser,
        userId,
    ]);

    return {
        pendingAction,
        reason,
        setReason,
        reasonError,
        canSubmitReason,
        openAction,
        closeAction,
        submitReasonAction,
        isMutating,
        suspendBlockReason,
    };
}
