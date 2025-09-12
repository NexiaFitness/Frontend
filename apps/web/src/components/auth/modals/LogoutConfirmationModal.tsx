/**
 * Modal de confirmación de logout profesional y limpio
 * Previene logouts accidentales sin sobreexplicar al usuario
 * UX clara, directa y con botones de mismo tamaño para consistencia
 *
 * @author Nelson
 * @since v2.1.0
 * @updated v2.3.0 - Botones con ancho uniforme
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/buttons';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    userName?: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    isLoading = false,
    userName,
}) => {
    // Bloquea scroll del fondo cuando está abierto
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Fondo oscurecido */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-all animate-in zoom-in-95 duration-200">
                {/* Icono de advertencia */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Título y mensaje */}
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">¿Cerrar sesión?</h3>
                    <p className="text-gray-600">
                        {userName ? (
                            <>¿Seguro que quieres cerrar sesión, <strong>{userName}</strong>?</>
                        ) : (
                            '¿Seguro que deseas cerrar sesión?'
                        )}
                    </p>
                </div>

                {/* Botones (mismo ancho) */}
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2.5 min-w-[160px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="px-6 py-2.5 min-w-[160px]"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Cerrando...
                            </div>
                        ) : (
                            'Cerrar Sesión'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
