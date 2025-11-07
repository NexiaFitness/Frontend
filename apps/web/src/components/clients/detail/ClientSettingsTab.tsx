/**
 * ClientSettingsTab.tsx — Tab Settings del cliente
 *
 * Contexto:
 * - Configuración y acciones del cliente
 * - Edit profile, Delete client
 * - Zona de peligro (delete)
 *
 * Responsabilidades:
 * - Botón para editar cliente
 * - Botón para eliminar cliente (con confirmación usando DeleteClientModal)
 * - Mostrar metadata (created_at, updated_at)
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import { DeleteClientModal } from "@/components/clients/modals/DeleteClientModal";

interface ClientSettingsTabProps {
    client: Client;
    onDelete: () => void;
}

export const ClientSettingsTab: React.FC<ClientSettingsTabProps> = ({
    client,
    onDelete,
}) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleEdit = () => {
        navigate(`/dashboard/clients/${client.id}/edit`);
    };

    const handleDeleteSuccess = () => {
        onDelete();
    };

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                    Configuración General
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Editar Perfil del Cliente
                        </label>
                        <p className="text-sm text-gray-600 mb-3">
                            Modifica los datos personales, objetivos y métricas del cliente.
                        </p>
                        <div className="flex justify-end pt-4">
                            <Button variant="primary" size="md" onClick={handleEdit}>
                                Editar Cliente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                    Información del Sistema
                </h3>
                <div className="space-y-2 text-sm">
                    <InfoRow label="ID del cliente" value={client.id.toString()} />
                    <InfoRow label="Fecha de alta" value={client.fecha_alta} />
                    {client.created_at && (
                        <InfoRow
                            label="Creado el"
                            value={new Date(client.created_at).toLocaleString()}
                        />
                    )}
                    {client.updated_at && (
                        <InfoRow
                            label="Última actualización"
                            value={new Date(client.updated_at).toLocaleString()}
                        />
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-red-900 mb-2`}>
                    Zona de Peligro
                </h3>
                <p className="text-sm text-red-700 mb-4">
                    Eliminar este cliente es una acción permanente. Todos los datos asociados
                    (entrenamientos, progreso, feedback) serán eliminados.
                </p>
                <div className="flex justify-end pt-4">
                    <Button
                        variant="danger"
                        size="md"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Eliminar Cliente
                    </Button>
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteClientModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                client={client}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );
};

// ========================================
// HELPER COMPONENTS
// ========================================

interface InfoRowProps {
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{label}:</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
};