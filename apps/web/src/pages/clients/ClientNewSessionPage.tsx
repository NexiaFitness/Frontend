/**
 * ClientNewSessionPage.tsx — Nueva sesión en contexto cliente (ruta anidada)
 *
 * Contexto:
 * - Ruta: /dashboard/clients/:id/sessions/new. Misma cabecera y breadcrumb que Client Detail.
 * - No redirige a session-programming; el entrenador no sale del cliente (Plan integración flujo planificación UX, paso 1.4).
 * - Reutiliza CreateSession con clientId y returnTo fijos desde la URL.
 *
 * @author Frontend Team
 * @since Fase 1 U4 — Plan integración flujo planificación UX
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { ClientHeader } from "@/components/clients/detail/ClientHeader";
import { CreateSession } from "@/pages/sessionProgramming/CreateSession";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";

export const ClientNewSessionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const clientId = parseInt(id || "0", 10);

    const { data: client, isLoading, error } = useGetClientQuery(clientId, {
        skip: !id || isNaN(clientId),
    });

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

    if (isLoading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="space-y-8">
                <Alert variant="error">Error al cargar el cliente.</Alert>
                <Button variant="outline" onClick={() => navigate(`/dashboard/clients/${clientId}`)}>
                    Volver al cliente
                </Button>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        {
            label: `${client.nombre} ${client.apellidos}`,
            path: `/dashboard/clients/${clientId}`,
        },
        { label: "Nueva sesión", active: true },
    ];

    const returnToPath = `/dashboard/clients/${clientId}?tab=sessions`;
    const backPath = `/dashboard/clients/${clientId}`;

    return (
        <div className="space-y-8">
            <ClientHeader
                client={client}
                clientId={clientId}
                breadcrumbItems={breadcrumbItems}
            />
            <CreateSession
                clientIdProp={clientId}
                returnToPath={returnToPath}
                backPath={backPath}
            />
        </div>
    );
};
