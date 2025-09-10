/**
 * Componente LogoutButton profesional y reutilizable
 * Incluye modal de confirmación, estados de loading y error handling
 * Optimizado para Admin, Trainer, Athlete dashboards
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/buttons";
import { LogoutConfirmationModal } from '@/components/ui/modals/LogoutConfirmationModal';
import { useLogout } from '@shared/hooks/useLogout';
import type { ButtonVariant, ButtonSize } from '@/components/ui/buttons';

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
    variant = 'secondary',
    size = 'md',
    className = '',
    children = 'Cerrar Sesión',
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
        }
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

    const displayName = showUserName && user 
        ? `${user.nombre || ''} ${user.apellidos || ''}`.trim() 
        : undefined;

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleButtonClick}
                disabled={disabled || isLoading}
                className={`
                    w-full py-3 bg-white text-black border-2 border-sidebar-header 
                    hover:bg-sidebar-header hover:text-white transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLoading ? 'animate-pulse' : ''}
                    ${className}
                `}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        Cerrando...
                    </div>
                ) : (
                    children
                )}
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
                        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-700 font-medium">Cerrando sesión...</p>
                        <p className="text-slate-500 text-sm mt-2">Procesando logout de forma segura</p>
                    </div>
                </div>
            )}

            {/* Error notification */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-300 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300">
                    <p className="text-red-700 text-sm font-medium">Error durante logout</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                </div>
            )}
        </>
    );
};
