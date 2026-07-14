/**
 * AthleteAccountPage.tsx — Mi cuenta atleta V13 (F3b-FE-06 Ola A).
 * Contexto: mobile-first, tokens atleta. Contratos: agent.md, DESIGN_MOBILE §7.
 */

import React from "react";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import { AthleteAccountProfileHero } from "@/components/athlete/account/AthleteAccountProfileHero";
import { AthleteProfileEditForm } from "@/components/athlete/account/AthleteProfileEditForm";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import { AthleteNotificationPrefsCard } from "@/components/athlete/AthleteNotificationPrefsCard";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import { AthleteChangePasswordSheetForm } from "@/components/athlete/account/AthleteChangePasswordSheetForm";
import { AthleteSheetSubmitButton } from "@/components/athlete/account/AthleteSheetSubmitButton";
import { DeleteAccountModal } from "@/components/account/modals/DeleteAccountModal";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { useAthleteAccount } from "@/hooks/athlete/useAthleteAccount";
import { useChangePasswordForm } from "@/hooks/account/useChangePasswordForm";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export const AthleteAccountPage: React.FC = () => {
    const isDesktop = useIsAthleteDesktopLayout();
    const {
        user,
        email,
        firstName,
        fullName,
        initials,
        memberSince,
        profileForm,
        isLoading,
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
    } = useAthleteAccount();
    const changePasswordForm = useChangePasswordForm();

    if (isLoading) {
        return <AthletePageLoading variant="account" />;
    }

    return (
        <>
            <div className={cn("mx-auto max-w-2xl space-y-6 lg:max-w-3xl lg:space-y-8", ATHLETE_PAGE)}>
                <AthleteAccountProfileHero
                    firstName={firstName}
                    fullName={fullName}
                    email={email}
                    initials={initials}
                    memberSince={memberSince}
                />

                <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
                    <AthleteNotificationPrefsCard />

                    <div className="space-y-6">
                        <AthleteSettingsSection title="Ajustes">
                            <AthleteSettingsRow
                                icon={UserRound}
                                label="Editar perfil"
                                hint="Nombre, apellidos y correo"
                                onClick={openEditSheet}
                            />
                            <AthleteSettingsRow
                                icon={KeyRound}
                                label="Cambiar contraseña"
                                hint="Actualiza tu acceso de forma segura"
                                onClick={openPasswordSheet}
                                isLast
                            />
                        </AthleteSettingsSection>

                        <AthleteSettingsSection title="Sesión">
                            <AthleteSettingsRow
                                icon={LogOut}
                                label="Cerrar sesión"
                                hint="Salir de este dispositivo"
                                onClick={() => void handleLogout()}
                                showChevron={false}
                                variant="destructive"
                                isLast
                            />
                        </AthleteSettingsSection>
                    </div>
                </div>

                {user?.role !== "admin" && (
                    <div className="pt-2 text-center lg:col-span-2">
                        <button
                            type="button"
                            onClick={openDeleteModal}
                            className="text-sm font-medium text-destructive/80 underline-offset-4 transition-colors hover:text-destructive hover:underline"
                        >
                            Eliminar cuenta
                        </button>
                    </div>
                )}
            </div>

            {isDesktop ? (
                <>
                    <BaseModal
                        isOpen={editSheetOpen}
                        onClose={closeEditSheet}
                        title="Editar perfil"
                        description="Nombre, apellidos y correo"
                        maxWidth="md"
                    >
                        <AthleteProfileEditForm profile={profileForm} />
                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                            <Button
                                variant="ghost"
                                className="w-full sm:flex-1"
                                onClick={closeEditSheet}
                            >
                                Cancelar
                            </Button>
                            <div className="w-full sm:flex-1">
                                <AthleteSheetSubmitButton
                                    form="athlete-profile-edit-form"
                                    label="Guardar cambios"
                                    loadingLabel="Guardando..."
                                    isLoading={profileForm.isLoading}
                                />
                            </div>
                        </div>
                    </BaseModal>

                    <BaseModal
                        isOpen={passwordSheetOpen}
                        onClose={closePasswordSheet}
                        title="Cambiar contraseña"
                        description="Mantén tu acceso seguro"
                        maxWidth="md"
                    >
                        <AthleteChangePasswordSheetForm form={changePasswordForm} />
                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                            <Button
                                variant="ghost"
                                className="w-full sm:flex-1"
                                onClick={closePasswordSheet}
                            >
                                Cancelar
                            </Button>
                            <div className="w-full sm:flex-1">
                                <AthleteSheetSubmitButton
                                    form="athlete-change-password-form"
                                    label="Actualizar contraseña"
                                    loadingLabel="Actualizando..."
                                    isLoading={changePasswordForm.isLoading}
                                />
                            </div>
                        </div>
                    </BaseModal>
                </>
            ) : (
                <>
                    <BottomSheet
                        isOpen={editSheetOpen}
                        onClose={closeEditSheet}
                        title="Editar perfil"
                        subtitle="Nombre, apellidos y correo"
                        footer={
                            <AthleteSheetSubmitButton
                                form="athlete-profile-edit-form"
                                label="Guardar cambios"
                                loadingLabel="Guardando..."
                                isLoading={profileForm.isLoading}
                            />
                        }
                    >
                        <AthleteProfileEditForm profile={profileForm} />
                    </BottomSheet>

                    <BottomSheet
                        isOpen={passwordSheetOpen}
                        onClose={closePasswordSheet}
                        title="Cambiar contraseña"
                        subtitle="Mantén tu acceso seguro"
                        footer={
                            <AthleteSheetSubmitButton
                                form="athlete-change-password-form"
                                label="Actualizar contraseña"
                                loadingLabel="Actualizando..."
                                isLoading={changePasswordForm.isLoading}
                            />
                        }
                    >
                        <AthleteChangePasswordSheetForm form={changePasswordForm} />
                    </BottomSheet>
                </>
            )}

            <DeleteAccountModal
                isOpen={deleteOpen}
                onClose={closeDeleteModal}
                onDeleteSuccess={handleDeleteSuccess}
                userName={fullName}
                userEmail={email}
            />

            {isLoggingOut && (
                <span className="sr-only" aria-live="polite">
                    Cerrando sesión…
                </span>
            )}
        </>
    );
};

export default AthleteAccountPage;
