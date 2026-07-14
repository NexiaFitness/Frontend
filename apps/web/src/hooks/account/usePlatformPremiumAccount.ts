/**
 * usePlatformPremiumAccount.ts — Orquestación Mi cuenta premium (admin / trainer).
 * Reutiliza patrón V13 atleta sin contexto de cliente.
 */

import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, selectUser, useLogout } from "@nexia/shared";
import type { AppDispatch } from "@nexia/shared/store";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import {
    getAthleteDisplayFirstName,
    getAthleteProfileInitials,
} from "@nexia/shared/utils/athlete/athleteProfileDisplay";
import { useAccountProfileUpdate } from "@/hooks/account/useAccountProfileUpdate";

const ROLE_META: Record<string, string> = {
    [USER_ROLES.ADMIN]: "Administrador NEXIA",
    [USER_ROLES.TRAINER]: "Cuenta entrenador",
};

export function usePlatformPremiumAccount() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const profileForm = useAccountProfileUpdate();

    const [editSheetOpen, setEditSheetOpen] = useState(false);
    const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { logout: handleLogout, isLoading: isLoggingOut } = useLogout({
        onNavigate: (path) => navigate(path, { replace: true }),
    });

    const firstName = useMemo(
        () => getAthleteDisplayFirstName(user?.nombre ?? ""),
        [user?.nombre]
    );

    const fullName = useMemo(
        () => `${user?.nombre ?? ""} ${user?.apellidos ?? ""}`.trim(),
        [user?.nombre, user?.apellidos]
    );

    const initials = useMemo(
        () =>
            getAthleteProfileInitials(user?.nombre ?? "", user?.apellidos ?? ""),
        [user?.nombre, user?.apellidos]
    );

    const metaLine = useMemo(() => {
        const role = user?.role ?? "";
        return ROLE_META[role] ?? null;
    }, [user?.role]);

    const openEditSheet = useCallback(() => setEditSheetOpen(true), []);
    const closeEditSheet = useCallback(() => setEditSheetOpen(false), []);
    const openPasswordSheet = useCallback(() => setPasswordSheetOpen(true), []);
    const closePasswordSheet = useCallback(() => setPasswordSheetOpen(false), []);
    const openDeleteModal = useCallback(() => setDeleteOpen(true), []);
    const closeDeleteModal = useCallback(() => setDeleteOpen(false), []);

    const handleDeleteSuccess = useCallback(async () => {
        await dispatch(logout());
        navigate("/auth/login", { replace: true });
    }, [dispatch, navigate]);

    return {
        user,
        email: user?.email ?? "",
        firstName,
        fullName,
        initials,
        metaLine,
        profileForm,
        isLoading: !user,
        editSheetOpen,
        passwordSheetOpen,
        deleteOpen,
        isLoggingOut,
        openEditSheet,
        closeEditSheet,
        openPasswordSheet,
        closePasswordSheet,
        openDeleteModal,
        closeDeleteModal,
        handleLogout,
        handleDeleteSuccess,
    };
}
