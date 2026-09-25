/**
 * AdminOrganizationsDetailPage.tsx — Ficha organización (G1, solo lectura).
 */

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/feedback";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import { useAdminOrganizationDetail } from "@/components/admin/organizations/useAdminOrganizationDetail";
import {
    ADMIN_ORGS_ALERT_SPACING,
    ADMIN_ORGS_BACK_BUTTON,
    ADMIN_ORGS_COPY,
    ADMIN_ORGS_DETAIL_CARD,
    ADMIN_ORGS_DETAIL_CARD_TITLE,
    ADMIN_ORGS_GLOW,
    ADMIN_ORGS_HEADER_ACTIONS,
    ADMIN_ORGS_LOADING_ROW,
    ADMIN_ORGS_PAGE_HEADER,
    ADMIN_ORGS_SECTION_GRID,
    ADMIN_ORGS_STACK,
    ADMIN_ORGS_TITLE_WRAP,
    billingBadgeVariant,
    billingLabel,
} from "@/components/admin/organizations/adminOrganizationsPresentation";
import { formatAdminDateTime } from "@/components/admin/users/adminUsersPresentation";

export const AdminOrganizationsDetailPage: React.FC = () => {
    const detail = useAdminOrganizationDetail();

    if (detail.skip) {
        return (
            <Alert variant="error" className={ADMIN_ORGS_ALERT_SPACING}>
                Identificador de organización no válido.
            </Alert>
        );
    }

    const org = detail.org;

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-organization-detail">
            <div className={ADMIN_ORGS_GLOW} aria-hidden />
            <div className={ADMIN_ORGS_STACK}>
                <div className={ADMIN_ORGS_PAGE_HEADER}>
                    <div className={ADMIN_ORGS_TITLE_WRAP}>
                        <PageTitle title={org?.name ?? ADMIN_ORGS_COPY.listTitle} />
                        {org ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {org.slug}
                                {org.is_personal ? ` · ${ADMIN_ORGS_COPY.personalBadge}` : ""}
                            </p>
                        ) : null}
                    </div>
                    <div className={ADMIN_ORGS_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_ORGS_BACK_BUTTON}
                            onClick={detail.backToList}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_ORGS_COPY.backToList}
                        </Button>
                    </div>
                </div>

                {detail.isLoading ? (
                    <p className={ADMIN_ORGS_LOADING_ROW}>Cargando…</p>
                ) : null}

                {detail.isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_ORGS_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => detail.refetch()}
                            >
                                {ADMIN_ORGS_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_ORGS_COPY.loadError}
                    </Alert>
                ) : null}

                {org ? (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {org.is_active ? (
                                <Badge variant="subtle-success">Activa</Badge>
                            ) : (
                                <Badge variant="subtle-warning">
                                    {ADMIN_ORGS_COPY.inactiveBadge}
                                </Badge>
                            )}
                            <Badge variant="secondary">{org.subscription_tier}</Badge>
                            <Badge variant={billingBadgeVariant(org.billing_status)}>
                                {billingLabel(org.billing_status)}
                            </Badge>
                        </div>

                        <div className={ADMIN_ORGS_SECTION_GRID}>
                            <section className={ADMIN_ORGS_DETAIL_CARD}>
                                <NexiaGlassAccentRim />
                                <h2 className={ADMIN_ORGS_DETAIL_CARD_TITLE}>Datos</h2>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">Descripción</dt>
                                        <dd>{org.description?.trim() || "—"}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Email facturación</dt>
                                        <dd>{org.billing_email ?? "—"}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Creada</dt>
                                        <dd>{formatAdminDateTime(org.created_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Actualizada</dt>
                                        <dd>{formatAdminDateTime(org.updated_at)}</dd>
                                    </div>
                                </dl>
                            </section>

                            <section className={ADMIN_ORGS_DETAIL_CARD}>
                                <NexiaGlassAccentRim />
                                <h2 className={ADMIN_ORGS_DETAIL_CARD_TITLE}>
                                    {ADMIN_ORGS_COPY.detailBilling}
                                </h2>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">Plan</dt>
                                        <dd>{org.subscription_tier}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Estado</dt>
                                        <dd>
                                            <Badge
                                                variant={billingBadgeVariant(org.billing_status)}
                                            >
                                                {billingLabel(org.billing_status)}
                                            </Badge>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Caduca</dt>
                                        <dd>
                                            {formatAdminDateTime(org.subscription_expires_at)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            {ADMIN_ORGS_COPY.detailLimits}
                                        </dt>
                                        <dd>
                                            {org.trainers_count}/{org.max_trainers} entrenadores ·{" "}
                                            {org.clients_count}/{org.max_clients} clientes ·{" "}
                                            {org.gyms_count} gimnasios
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        </div>

                        <section className={ADMIN_ORGS_DETAIL_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className={ADMIN_ORGS_DETAIL_CARD_TITLE}>
                                {ADMIN_ORGS_COPY.detailMembers}
                            </h2>
                            {org.members.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {ADMIN_ORGS_COPY.noMembers}
                                </p>
                            ) : (
                                <ul className="divide-y divide-border/50">
                                    {org.members.map((member) => (
                                        <li
                                            key={`${member.user_id}-${member.role}`}
                                            className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {member.full_name?.trim() ||
                                                        member.email ||
                                                        `Usuario #${member.user_id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.email ?? "—"} · {member.role}
                                                    {member.is_active ? "" : " · inactivo"}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost-primary"
                                                size="sm"
                                                onClick={() => detail.openUser(member.user_id)}
                                            >
                                                Ver usuario
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className={ADMIN_ORGS_DETAIL_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className={ADMIN_ORGS_DETAIL_CARD_TITLE}>
                                {ADMIN_ORGS_COPY.detailGyms}
                            </h2>
                            {org.gyms.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {ADMIN_ORGS_COPY.noGyms}
                                </p>
                            ) : (
                                <ul className="space-y-4">
                                    {org.gyms.map((gym) => (
                                        <li
                                            key={gym.id}
                                            className="rounded-xl border border-border/50 bg-surface-2/30 p-3"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-medium">{gym.name}</p>
                                                {gym.is_active ? (
                                                    <Badge variant="subtle-success">Activo</Badge>
                                                ) : (
                                                    <Badge variant="subtle-warning">Inactivo</Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {gym.address?.trim() || "Sin dirección"} ·{" "}
                                                {gym.inventory_items_count} ítems
                                            </p>
                                            {gym.inventory_preview.length === 0 ? (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {ADMIN_ORGS_COPY.inventoryEmpty}
                                                </p>
                                            ) : (
                                                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                    {gym.inventory_preview.map((item) => (
                                                        <li key={item.id}>
                                                            {item.name} × {item.quantity}
                                                            {item.condition
                                                                ? ` · ${item.condition}`
                                                                : ""}
                                                            {item.is_available
                                                                ? ""
                                                                : " · no disponible"}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                ) : null}
            </div>
        </div>
    );
};
