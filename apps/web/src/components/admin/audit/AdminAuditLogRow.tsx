/**
 * AdminAuditLogRow.tsx — Fila/card de entrada de auditoría (desktop + móvil).
 */

import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import type { AdminAuditLogItemOut } from "@nexia/shared/types/adminUsers";
import {
    ADMIN_AUDIT_CARD_ITEM,
    ADMIN_AUDIT_REASON,
    ADMIN_AUDIT_ROW,
    ADMIN_AUDIT_TECH_DETAILS,
    auditCategoryBadgeVariant,
    auditCategoryForAction,
    auditCategoryLabel,
    formatAdminAuditDateTime,
    formatAdminAuditRelativeTime,
    formatAdminAuditSentence,
    formatAdminAuditUserDisplayName,
} from "@/components/admin/audit/adminAuditPresentation";
import { formatAdminUserRole } from "@/components/admin/users/adminUsersPresentation";

function UserLink({
    userId,
    name,
    role,
    muted = false,
}: {
    userId: number;
    name: string;
    role?: string | null;
    muted?: boolean;
}) {
    return (
        <Link
            to={`/dashboard/admin/users/${userId}`}
            className={
                muted
                    ? "text-muted-foreground hover:text-primary hover:underline"
                    : "font-medium text-primary hover:underline"
            }
        >
            {name}
            {role ? ` (${formatAdminUserRole(role)})` : ""}
        </Link>
    );
}

export interface AdminAuditLogRowProps {
    entry: AdminAuditLogItemOut;
    variant?: "row" | "card";
    compact?: boolean;
}

export const AdminAuditLogRow: React.FC<AdminAuditLogRowProps> = ({
    entry,
    variant = "row",
    compact = false,
}) => {
    const category = auditCategoryForAction(entry.action);
    const shellClass = variant === "card" ? ADMIN_AUDIT_CARD_ITEM : ADMIN_AUDIT_ROW;

    const actorName = formatAdminAuditUserDisplayName(entry.actor, entry.actor_user_id);
    const targetName = formatAdminAuditUserDisplayName(entry.target_user, entry.target_user_id);

    const hasTech =
        entry.request_path ||
        entry.ip ||
        entry.request_method ||
        entry.status_code != null ||
        (entry.detail && Object.keys(entry.detail).length > 0);

    return (
        <article className={shellClass} data-testid={`audit-entry-${entry.id}`}>
            <div className="flex items-start justify-between gap-3">
                <Badge variant={auditCategoryBadgeVariant(category)}>{auditCategoryLabel(category)}</Badge>
                <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={entry.created_at}
                    title={formatAdminAuditDateTime(entry.created_at)}
                >
                    {formatAdminAuditRelativeTime(entry.created_at)}
                </time>
            </div>

            <p className={compact ? "text-sm font-medium" : "mt-2 text-sm font-medium text-foreground"}>
                {formatAdminAuditSentence(entry)}
            </p>

            {entry.reason ? (
                <blockquote className={ADMIN_AUDIT_REASON}>«{entry.reason}»</blockquote>
            ) : null}

            {!compact && (entry.actor_user_id || entry.target_user_id) ? (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {entry.actor_user_id ? (
                        <span>
                            Actor:{" "}
                            <UserLink
                                userId={entry.actor_user_id}
                                name={actorName}
                                role={entry.actor?.role}
                                muted
                            />
                        </span>
                    ) : null}
                    {entry.target_user_id ? (
                        <span>
                            Objetivo:{" "}
                            <UserLink
                                userId={entry.target_user_id}
                                name={targetName}
                                role={entry.target_user?.role}
                            />
                        </span>
                    ) : null}
                </div>
            ) : null}

            {hasTech && !compact ? (
                <details className={ADMIN_AUDIT_TECH_DETAILS}>
                    <summary className="cursor-pointer select-none text-primary/80 hover:text-primary">
                        Detalles técnicos
                    </summary>
                    <ul className="mt-2 space-y-1 break-all">
                        {entry.request_method && entry.request_path ? (
                            <li>
                                {entry.request_method} {entry.request_path}
                            </li>
                        ) : null}
                        {entry.ip ? <li>IP: {entry.ip}</li> : null}
                        {entry.status_code != null ? <li>HTTP {entry.status_code}</li> : null}
                        {entry.detail ? (
                            <li>
                                <pre className="mt-1 whitespace-pre-wrap rounded bg-surface-2/50 p-2 text-[11px]">
                                    {JSON.stringify(entry.detail, null, 2)}
                                </pre>
                            </li>
                        ) : null}
                    </ul>
                </details>
            ) : null}
        </article>
    );
};
