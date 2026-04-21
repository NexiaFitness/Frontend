/**
 * ClientNewSessionPage.tsx — Nueva sesión en contexto cliente (ruta anidada)
 *
 * Rutas:
 * - /dashboard/clients/:id/sessions/new — sin plan activo: CreateSession completa; con plan: paso calend + panel.
 * - /dashboard/clients/:id/sessions/new/constructor — constructor (formulario + bloques), fecha en ?date=.
 *
 * @author Frontend Team
 * @since Fase 1 U4 — Plan integración flujo planificación UX
 */

import React, { useLayoutEffect } from "react";
import { useParams, useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { ClientHeader } from "@/components/clients/detail/ClientHeader";
import { CreateSession } from "@/pages/sessionProgramming/CreateSession";
import { ClientSessionScheduleStep } from "@/pages/clients/ClientSessionScheduleStep";
import { useClientActivePlanSessionSchedule } from "@/hooks/clients/useClientActivePlanSessionSchedule";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";

interface BranchProps {
  clientId: number;
  returnToPath: string;
  backPath: string;
}

const ClientNewSessionIndexBranch: React.FC<BranchProps> = ({
  clientId,
  returnToPath,
  backPath,
}) => {
  const { activePlanForClient, isLoadingActivePlan } = useClientActivePlanSessionSchedule(clientId);

  if (isLoadingActivePlan) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!activePlanForClient) {
    return (
      <CreateSession clientIdProp={clientId} returnToPath={returnToPath} backPath={backPath} />
    );
  }

  return <ClientSessionScheduleStep clientId={clientId} backPath={backPath} />;
};

const ClientNewSessionConstructorBranch: React.FC<BranchProps> = ({
  clientId,
  returnToPath,
  backPath,
}) => {
  const { activePlanForClient, isLoadingActivePlan } = useClientActivePlanSessionSchedule(clientId);

  if (isLoadingActivePlan) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!activePlanForClient) {
    return <Navigate to={`/dashboard/clients/${clientId}/sessions/new`} replace />;
  }

  return (
    <CreateSession clientIdProp={clientId} returnToPath={returnToPath} backPath={backPath} />
  );
};

export const ClientNewSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = parseInt(id || "0", 10);

  /** El área scrollable del dashboard conserva offset al cambiar de ruta; al entrar en nueva sesión volver arriba. */
  useLayoutEffect(() => {
    document.getElementById("dashboard-main-scroll")?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

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

  const branchProps: BranchProps = {
    clientId,
    returnToPath,
    backPath,
  };

  return (
    <div className="space-y-8">
      <ClientHeader client={client} clientId={clientId} breadcrumbItems={breadcrumbItems} />
      <Routes>
        <Route index element={<ClientNewSessionIndexBranch {...branchProps} />} />
        <Route
          path="constructor"
          element={<ClientNewSessionConstructorBranch {...branchProps} />}
        />
        <Route path="*" element={<Navigate to={`/dashboard/clients/${clientId}/sessions/new`} replace />} />
      </Routes>
    </div>
  );
};
