/**
 * PlatformPremiumAccountPage.tsx — Mi cuenta premium V13 para admin/trainer (experimento UX).
 * Tokens: DESIGN_MOBILE §6.7, F3b_PREMIUM_DESIGN_SYSTEM.md
 */

import React from "react";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import { AthleteAccountProfileHero } from "@/components/athlete/account/AthleteAccountProfileHero";
import { AthleteProfileEditForm } from "@/components/athlete/account/AthleteProfileEditForm";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import { AthleteChangePasswordSheetForm } from "@/components/athlete/account/AthleteChangePasswordSheetForm";
import { AthleteSheetSubmitButton } from "@/components/athlete/account/AthleteSheetSubmitButton";
import { DeleteAccountModal } from "@/components/account/modals/DeleteAccountModal";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback";
import { usePlatformPremiumAccount } from "@/hooks/account/usePlatformPremiumAccount";
import { useChangePasswordForm } from "@/hooks/account/useChangePasswordForm";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const PLATFORM_ACCOUNT_PAGE = "px-4 pt-4 pb-12 lg:px-8 lg:pb-20";

export const PlatformPremiumAccountPage: React.FC = () => {
    const isDesktop = useIsAthleteDesktopLayout();
    const {
        user,
        email,
        firstName,
        fullName,
        initials,
        metaLine,
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
    } = usePlatformPremiumAccount();
    const changePasswordForm = useChangePasswordForm();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-12 lg:px-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <div
                className={cn(
                    "relative mx-auto max-w-2xl space-y-6 lg:max-w-3xl lg:space-y-8",
                    PLATFORM_ACCOUNT_PAGE
                )}
            >
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_70%)]"
                    aria-hidden
                />

                <AthleteAccountProfileHero
                    firstName={firstName}
                    fullName={fullName}
                    email={email}
                    initials={initials}
                    metaLine={metaLine}
                />

                <div className="relative space-y-6 lg:max-w-xl">
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

                {user?.role !== "admin" && (
                    <div className="relative pt-2 text-center">
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

export default PlatformPremiumAccountPage;
