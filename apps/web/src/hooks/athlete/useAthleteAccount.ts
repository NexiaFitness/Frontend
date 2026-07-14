/**
 * useAthleteAccount.ts — Orquestación V13 Mi cuenta atleta (F3b-FE-06).
 */

import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, selectUser, useLogout } from "@nexia/shared";
import type { AppDispatch } from "@nexia/shared/store";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    formatAthleteMemberSince,
    getAthleteDisplayFirstName,
    getAthleteProfileInitials,
} from "@nexia/shared/utils/athlete/athleteProfileDisplay";
import { useAccountProfileUpdate } from "@/hooks/account/useAccountProfileUpdate";

export function useAthleteAccount() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const { profile, isLoading: profileLoading } = useAthleteContext();
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

    const memberSince = useMemo(
        () => formatAthleteMemberSince(profile?.fecha_alta),
        [profile?.fecha_alta]
    );

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
        memberSince,
        profileForm,
        isLoading: profileLoading && !user,
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
