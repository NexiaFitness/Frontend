/**
 * Modal de confirmación para eliminar cliente
 * Previene eliminaciones accidentales con confirmación clara
 * Botones unificados en tamaño para consistencia visual
 *
 * @autor Nelson
 * @since v2.1.0
 * @updated v2.3.0 - Botones outline/danger con mismo ancho
 */

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/buttons';
import { useDeleteClientMutation } from '@shared/api/clientsApi';
import type { Client } from '@shared/types/client';

interface DeleteClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onDeleteSuccess?: () => void;
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
    isOpen,
    onClose,
    client,
    onDeleteSuccess,
}) => {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const [deleteClient, { isLoading }] = useDeleteClientMutation();

    const handleDelete = async () => {
        if (!client) return;

        try {
            await deleteClient(client.id).unwrap();
            onDeleteSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error eliminando cliente:', error);
        }
    };

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                cancelButtonRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen || !client) return null;

    const handleBackdropClick = () => {
        if (!isLoading) {
            onClose();
        }
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
                aria-labelledby="delete-client-title"
                aria-describedby="delete-client-description"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h3 id="delete-client-title" className="text-xl font-bold text-gray-900 mb-3">
                        Eliminar Cliente
                    </h3>
                    <p id="delete-client-description" className="text-gray-600 mb-2">
                        ¿Estás seguro de que deseas eliminar a{' '}
                        <strong className="text-gray-900">
                            {client.nombre} {client.apellidos}
                        </strong>?
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                        Esta acción no se puede deshacer.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{client.email}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Objetivo:</span>
                        <span className="font-medium capitalize">{client.objetivo.replace('_', ' ')}</span>
                    </div>
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
                            'Eliminar Cliente'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
