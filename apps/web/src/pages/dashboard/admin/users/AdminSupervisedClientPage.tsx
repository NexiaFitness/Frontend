/**
 * AdminSupervisedClientPage.tsx — Ficha del cliente supervisado por el admin (SUP F2,
 * solo lectura), con pestañas Ficha y Progreso.
 *
 * Contexto: el entrenador de alcance es el de la URL (`/admin/users/:userId/clients/
 * :clientId`); useAdminSupervisedClient resuelve su trainer_id. La pestaña Progreso
 * reutiliza ClientProgressTab del entrenador dentro de ClientViewScopeContext
 * (readOnly + ese trainer_id), así el admin ve las mismas cifras sin acciones de escritura.
 *
 * Notas de mantenimiento: pestaña en `?tab=` (useTabNavigation); la subpestaña de
 * Progreso usa `?subtab=`. Clases y copy en adminSupervisionPresentation.ts.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import React, { Suspense, lazy, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { PageTitle } from "@/components/dashboard/shared";
import { TabsBar } from "@/components/ui/tabs";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    ClientViewScopeContext,
    type ClientViewScope,
} from "@/components/clients/detail/clientViewScope";
import { useAdminSupervisedClient } from "@/components/admin/supervision/useAdminSupervisedClient";
import { AdminSupervisedClientProfile } from "@/components/admin/supervision/AdminSupervisedClientProfile";
import { AdminSupervisedClientSessions } from "@/components/admin/supervision/AdminSupervisedClientSessions";
import {
    ADMIN_SUP_ALERT_SPACING,
    ADMIN_SUP_BANNER,
    ADMIN_SUP_COPY,
    ADMIN_SUP_GLOW,
    ADMIN_SUP_HEADER_ACTIONS,
    ADMIN_SUP_HEADER_META,
    ADMIN_SUP_LOADING_ROW,
    ADMIN_SUP_PAGE_HEADER,
    ADMIN_SUP_STACK,
    ADMIN_SUP_TAB_CONTENT,
    ADMIN_SUP_TITLE_WRAP,
} from "@/components/admin/supervision/adminSupervisionPresentation";

const ClientProgressTab = lazy(() =>
    import("@/components/clients/detail/ClientProgressTab").then((module) => ({
        default: module.ClientProgressTab,
    }))
);

type SupervisedTabId = "profile" | "progress";

const SUPERVISED_TABS: { id: SupervisedTabId; label: string }[] = [
    { id: "profile", label: ADMIN_SUP_COPY.tabProfile },
    { id: "progress", label: ADMIN_SUP_COPY.tabProgress },
];

const SUPERVISED_TAB_IDS = SUPERVISED_TABS.map((t) => t.id);

export const AdminSupervisedClientPage: React.FC = () => {
    const { userId: userIdParam, clientId: clientIdParam } = useParams<{
        userId: string;
        clientId: string;
    }>();
    const userId = Number(userIdParam);
    const clientId = Number(clientIdParam);
    const { goBack } = useReturnToOrigin({
        fallbackPath: Number.isFinite(userId) && userId > 0
            ? `/dashboard/admin/users/${userId}`
            : "/dashboard/admin/users",
    });
    const { activeTab, setActiveTab } = useTabNavigation<SupervisedTabId>({
        validTabs: SUPERVISED_TAB_IDS,
        defaultTab: "profile",
    });

    const skip = !Number.isFinite(userId) || userId <= 0 || !Number.isFinite(clientId) || clientId <= 0;

    const data = useAdminSupervisedClient({
        userId: skip ? 0 : userId,
        clientId: skip ? 0 : clientId,
    });

    const viewScope = useMemo<ClientViewScope>(
        () => ({ trainerId: data.trainerId ?? undefined, readOnly: true }),
        [data.trainerId]
    );

    if (skip) {
        return (
            <Alert variant="error" className={ADMIN_SUP_ALERT_SPACING}>
                Identificadores no válidos.
            </Alert>
        );
    }

    const retryAction = (
        <Button
            type="button"
            variant="outline-destructive"
            size="sm"
            onClick={() => data.refetchAll()}
        >
            {ADMIN_SUP_COPY.retry}
        </Button>
    );
    const client = data.scopeDenied || data.trainerId == null ? null : data.client;

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-supervised-client">
            <div className={ADMIN_SUP_GLOW} aria-hidden />
            <div className={ADMIN_SUP_STACK}>
                <div className={ADMIN_SUP_PAGE_HEADER}>
                    <div className={ADMIN_SUP_TITLE_WRAP}>
                        <PageTitle title={data.clientDisplayName} />
                        <p className={ADMIN_SUP_HEADER_META}>
                            {ADMIN_SUP_COPY.supervisedTitle} · Entrenador: {data.trainerDisplayName}
                        </p>
                    </div>
                    <div className={ADMIN_SUP_HEADER_ACTIONS}>
                        <PlatformHeaderBackButton
                            onClick={() => goBack()}
                            label={ADMIN_SUP_COPY.backToTrainer}
                        />
                    </div>
                </div>

                <div className={ADMIN_SUP_BANNER} role="status">
                    {ADMIN_SUP_COPY.banner}
                </div>

                {data.isLoading ? <p className={ADMIN_SUP_LOADING_ROW}>Cargando…</p> : null}

                {data.trainerError ? (
                    <Alert variant="error" className={ADMIN_SUP_ALERT_SPACING} action={retryAction}>
                        No se pudo cargar la ficha del entrenador.
                    </Alert>
                ) : null}

                {data.scopeDenied ? (
                    <Alert variant="error" className={ADMIN_SUP_ALERT_SPACING}>
                        {ADMIN_SUP_COPY.scopeError}
                    </Alert>
                ) : null}

                {data.clientError ? (
                    <Alert variant="error" className={ADMIN_SUP_ALERT_SPACING} action={retryAction}>
                        No se pudo cargar el cliente.
                    </Alert>
                ) : null}

                {client ? (
                    <>
                        <TabsBar
                            items={SUPERVISED_TABS}
                            value={activeTab}
                            onChange={(id) => setActiveTab(id as SupervisedTabId)}
                            ariaLabel={ADMIN_SUP_COPY.tabsAriaLabel}
                        />
                        <div className={ADMIN_SUP_TAB_CONTENT}>
                            {activeTab === "profile" ? (
                                <>
                                    <AdminSupervisedClientProfile data={data} client={client} />
                                    <AdminSupervisedClientSessions data={data} />
                                </>
                            ) : (
                                <ClientViewScopeContext.Provider value={viewScope}>
                                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                                        <ClientProgressTab clientId={clientId} client={client} />
                                    </Suspense>
                                </ClientViewScopeContext.Provider>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
