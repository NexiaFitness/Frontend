/**
 * LogoutButton — Botón profesional y reutilizable para cerrar sesión
 *
 * Contexto:
 * - Usa Button base (variant + size).
 * - Incluye modal de confirmación opcional.
 * - Overlay global con spinner durante el proceso de logout.
 *
 * Decisiones:
 * - Se reemplazan clases manuales por presets de buttonStyles.
 * - Responsive: md en móvil/tablet, lg en pantallas grandes (heredado de formPrimary).
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v4.3.3 - Integración final con BUTTON_PRESETS
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { LogoutConfirmationModal } from "@/components/auth/modals/LogoutConfirmationModal";
import { useLogout } from "@nexia/shared/hooks/useLogout";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { TYPOGRAPHY } from "@/utils/typography";
import type { ButtonVariant, ButtonSize } from "./Button";

interface LogoutButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children?: React.ReactNode;
    confirmationRequired?: boolean;
    showUserName?: boolean;
    onLogoutStart?: () => void;
    onLogoutSuccess?: () => void;
    onLogoutError?: (error: string) => void;
    disabled?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
    variant = "secondary",
    size = "md", // base = md → escalará a lg en desktop
    className = "",
    children = "Cerrar sesión",
    confirmationRequired = true,
    showUserName = true,
    onLogoutStart,
    onLogoutSuccess,
    onLogoutError,
    disabled = false,
}) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const { logout, isLoading, error, user } = useLogout({
        onSuccess: () => {
            setShowModal(false);
            onLogoutSuccess?.();
        },
        onError: (errorMessage) => {
            setShowModal(false);
            onLogoutError?.(errorMessage);
        },
        onNavigate: (path) => {
            navigate(path, { replace: true });
        },
    });

    const handleButtonClick = () => {
        if (confirmationRequired) {
            setShowModal(true);
            onLogoutStart?.();
        } else {
            handleLogout();
        }
    };

    const handleLogout = async () => {
        onLogoutStart?.();
        await logout();
    };

    const displayName =
        showUserName && user
            ? `${user.nombre || ""} ${user.apellidos || ""}`.trim()
            : undefined;

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleButtonClick}
                disabled={disabled || isLoading}
                className={`${BUTTON_PRESETS.formPrimary} ${className}`}
            >
                <span className={TYPOGRAPHY.buttonText}>
                    {isLoading ? "Cerrando..." : children}
                </span>
            </Button>

            {/* Modal de confirmación */}
            {confirmationRequired && (
                <LogoutConfirmationModal
                    isOpen={showModal}
                    onConfirm={handleLogout}
                    onCancel={() => setShowModal(false)}
                    isLoading={isLoading}
                    userName={displayName}
                />
            )}

            {/* Overlay de loading global durante logout */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className={TYPOGRAPHY.successText}>Cerrando sesión...</p>
                        <p className={`${TYPOGRAPHY.caption} text-slate-500 mt-2`}>
                            Procesando logout de forma segura
                        </p>
                    </div>
                </div>
            )}

            {/* Error notification */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-300 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300">
                    <p className={`${TYPOGRAPHY.errorText} text-red-700`}>
                        Error durante logout
                    </p>
                    <p className={`${TYPOGRAPHY.caption} text-red-600 mt-1`}>
                        {error}
                    </p>
                </div>
            )}
        </>
    );
};
