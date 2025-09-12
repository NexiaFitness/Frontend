/**
 * Modal de confirmación para eliminar la cuenta del usuario autenticado.
 * Confirma una acción irreversible y orquesta la llamada a deleteAccount (RTK Query).
 *
 * @author Nelson
 * @since v1.0.0
 * @updated v2.3.0 - Botones unificados y outline en Cancelar
 */

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/buttons";
import { useDeleteAccountMutation } from "@shared/api/accountApi";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteSuccess?: () => void;
    userName?: string;
    userEmail?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    isOpen,
    onClose,
    onDeleteSuccess,
    userName,
    userEmail,
}) => {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

    const handleDelete = async () => {
        try {
            await deleteAccount().unwrap();
            onDeleteSuccess?.();
            onClose();
        } catch (error) {
            console.error("[DeleteAccountModal] Error al eliminar cuenta:", error);
        }
    };

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", onEsc);
            document.body.style.overflow = "hidden";
            setTimeout(() => cancelButtonRef.current?.focus(), 100);
        }

        return () => {
            document.removeEventListener("keydown", onEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        if (!isLoading) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            <div
                className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-all animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
                aria-describedby="delete-account-description"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h3 id="delete-account-title" className="text-xl font-bold text-gray-900 mb-3">
                        Eliminar cuenta
                    </h3>
                    <p id="delete-account-description" className="text-gray-600 mb-2">
                        ¿Estás seguro de que quieres eliminar tu cuenta
                        {userName ? (
                            <> (<strong className="text-gray-900">{userName}</strong>{userEmail ? ` · ${userEmail}` : ""})</>
                        ) : (
                            ""
                        )}
                        ?
                    </p>
                    <p className="text-sm text-red-600 font-medium">Esta acción es irreversible.</p>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button
                        ref={cancelButtonRef}
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2.5 min-w-[160px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="px-6 py-2.5 min-w-[160px]"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Eliminando...
                            </div>
                        ) : (
                            "Eliminar cuenta"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
