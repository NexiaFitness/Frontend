/**
 * ClientEdit.tsx — Página de edición de cliente
 *
 * Contexto:
 * - Permite editar datos personales, objetivos y métricas del cliente
 * - Usa ClientEditForm component
 * - Layout consistente con ClientDetail
 *
 * @author Frontend Team
 * @since v4.5.0
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { ClientEditForm } from "@/components/clients/forms/ClientEditForm";
import { ClientEquipmentSection } from "@/components/clients/ClientEquipmentSection";
import { Button } from "@/components/ui/buttons";
import { DeleteClientModal } from "@/components/clients/modals/DeleteClientModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageTitle } from "@/components/dashboard/shared/PageTitle";

export const ClientEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const clientId = parseInt(id || "0", 10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: client, isLoading, error } = useGetClientQuery(clientId, {
        skip: !id || isNaN(clientId),
    });

    // Validación de ID
    if (!id || isNaN(clientId)) {
        return (
            <div className="space-y-8">
                <Alert variant="error">ID de cliente inválido</Alert>
                <Button variant="outline" onClick={() => navigate("/dashboard/clients")}>
                    Volver a Clientes
                </Button>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (error || !client) {
        return (
            <div className="space-y-8">
                <Alert variant="error">
                    Error al cargar el cliente. Por favor, intenta nuevamente.
                </Alert>
                <Button variant="outline" onClick={() => navigate("/dashboard/clients")}>
                    Volver a Clientes
                </Button>
            </div>
        );
    }

    // Success handler
    const handleSuccess = () => {
        navigate(`/dashboard/clients/${clientId}`);
    };

    // Handler para desvincular cliente
    const handleUnlinkSuccess = () => {
        navigate("/dashboard/clients", { replace: true });
    };

    const breadcrumbItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: `${client.nombre} ${client.apellidos}`, path: `/dashboard/clients/${clientId}` },
        { label: "Editar perfil", active: true },
    ];

    return (
        <div className="space-y-8 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <PageTitle
                title="Editar perfil"
                subtitle="Modifica los datos personales, métricas antropométricas, parámetros de entrenamiento y notas del cliente. También puedes desvincular el cliente de tu lista."
            />

            <ClientEditForm client={client} onSuccess={handleSuccess} />

            <ClientEquipmentSection clientId={clientId} />

            {/* Zona de Peligro - Desvincular Cliente */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                    Zona de peligro
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Desvincular este cliente lo eliminará de tu lista. El cliente seguirá existiendo en el sistema.
                </p>
                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Desvincular cliente
                    </Button>
                </div>
            </div>

            <DeleteClientModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                client={client}
                onDeleteSuccess={handleUnlinkSuccess}
            />
        </div>
    );
};


