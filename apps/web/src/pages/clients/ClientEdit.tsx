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
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TRAINER_MENU_ITEMS } from "@/config/trainerNavigation";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { ClientEditForm } from "@/components/clients/forms/ClientEditForm";
import { Button } from "@/components/ui/buttons";
import { DeleteClientModal } from "@/components/clients/modals/DeleteClientModal";

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
            <>
                <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">
                            ID de cliente inválido
                        </Alert>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <>
                <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="flex items-center justify-center min-h-screen">
                        <LoadingSpinner size="lg" />
                    </div>
                </DashboardLayout>
            </>
        );
    }

    // Error state
    if (error || !client) {
        return (
            <>
                <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="p-6">
                        <Alert variant="error">
                            Error al cargar el cliente. Por favor, intenta nuevamente.
                        </Alert>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/dashboard/clients")}
                            >
                                Volver a la lista
                            </Button>
                        </div>
                    </div>
                </DashboardLayout>
            </>
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

    return (
        <>
            <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Encabezado responsive igual a dashboards */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 lg:mb-4">
                        Editar Cliente
                    </h2>
                    <p className="text-sm md:text-lg lg:text-xl text-white/80">
                        Modifica los datos personales, métricas antropométricas, parámetros de entrenamiento y notas del cliente. También puedes desvincular el cliente de tu lista.
                    </p>
                </div>

                {/* Contenido principal con ancho completo */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <ClientEditForm client={client} onSuccess={handleSuccess} />

                    {/* Zona de Peligro - Desvincular Cliente */}
                    <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-lg p-6">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 mb-2 text-center lg:text-left">
                            Zona de Peligro
                        </h3>
                        <p className="text-sm text-red-700 mb-4 text-center lg:text-left">
                            Desvincular este cliente lo eliminará de tu lista. El cliente seguirá existiendo en el sistema.
                        </p>
                        <div className="flex justify-center lg:justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white border-2 border-transparent hover:bg-red-700 hover:border-red-700 focus:ring-red-500 px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base sm:min-h-[44px]"
                            >
                                Desvincular Cliente
                            </button>
                        </div>
                    </div>

                    {/* Delete Modal */}
                    <DeleteClientModal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        client={client}
                        onDeleteSuccess={handleUnlinkSuccess}
                    />
                </div>
            </DashboardLayout>
        </>
    );
};


