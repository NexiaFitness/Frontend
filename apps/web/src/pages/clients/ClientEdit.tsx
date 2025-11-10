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

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { ClientEditForm } from "@/components/clients/forms/ClientEditForm";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";

export const ClientEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const clientId = parseInt(id || "0", 10);

    const { data: client, isLoading, error } = useGetClientQuery(clientId, {
        skip: !id || isNaN(clientId),
    });

    // Menu items para navbar
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Validación de ID
    if (!id || isNaN(clientId)) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
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
                <DashboardNavbar menuItems={menuItems} />
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
                <DashboardNavbar menuItems={menuItems} />
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

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />
            <DashboardLayout>
                <div className="min-h-screen bg-white -mt-16 md:-mt-18 lg:-mt-20 pt-4 lg:pt-6 pb-12 lg:pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className={`${TYPOGRAPHY.pageTitle} text-gray-900`}>
                                    Editar Cliente
                                </h1>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/dashboard/clients/${clientId}`)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                            <p className="text-gray-600">
                                Modifica los datos personales, objetivos y métricas del cliente.
                            </p>
                        </div>

                        {/* Form */}
                        <ClientEditForm client={client} onSuccess={handleSuccess} />
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

