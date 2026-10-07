/**
 * TrainerSessionsListRow — Fila premium del listado global de sesiones (entrenador).
 */

import React from "react";
import { Pencil } from "lucide-react";
import type { SessionOut } from "@nexia/shared/types/sessions";
import { ClientAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    SESSIONS_PAGE_EDIT_BTN,
    SESSIONS_PAGE_LIST_ITEM,
    SESSIONS_PAGE_LIST_ITEM_ASIDE,
    SESSIONS_PAGE_LIST_ITEM_CLIENT_NAME,
    SESSIONS_PAGE_LIST_ITEM_CLIENT_ROW,
    SESSIONS_PAGE_LIST_ITEM_DATE,
    SESSIONS_PAGE_LIST_ITEM_MAIN,
    SESSIONS_PAGE_LIST_ITEM_META,
    SESSIONS_PAGE_LIST_ITEM_TITLE,
    SESSIONS_PAGE_META_BADGE,
    SESSIONS_PAGE_TYPE_BADGE,
    SESSIONS_PAGE_TYPE_LABEL,
    sessionsPageStatusBadgeClass,
    sessionsPageStatusLabel,
} from "./sessionsPagePresentation";

export interface TrainerSessionsListRowProps {
    session: SessionOut;
    onOpen: () => void;
    onEdit: () => void;
    formatDate: (dateStr: string | null) => string;
}

export const TrainerSessionsListRow: React.FC<TrainerSessionsListRowProps> = ({
    session,
    onOpen,
    onEdit,
    formatDate,
}) => {
    const nameParts = session.client_name?.split(/\s+/) ?? [];
    const nombre = nameParts[0];
    const apellidos = nameParts.slice(1).join(" ") || undefined;

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen();
                }
            }}
            className={SESSIONS_PAGE_LIST_ITEM}
        >
            <NexiaGlassAccentRim />
            <div className={SESSIONS_PAGE_LIST_ITEM_MAIN}>
                <p className={SESSIONS_PAGE_LIST_ITEM_TITLE}>{session.session_name}</p>
                <div className={SESSIONS_PAGE_LIST_ITEM_CLIENT_ROW}>
                    <ClientAvatar
                        clientId={session.client_id}
                        nombre={nombre}
                        apellidos={apellidos}
                        size="sm"
                        className="shrink-0"
                    />
                    <span className={SESSIONS_PAGE_LIST_ITEM_CLIENT_NAME}>
                        {session.client_name ?? "—"}
                    </span>
                </div>
            </div>
            <div className={SESSIONS_PAGE_LIST_ITEM_ASIDE}>
                <span className={SESSIONS_PAGE_LIST_ITEM_DATE}>
                    {formatDate(session.session_date)}
                    {session.session_time ? ` · ${session.session_time.slice(0, 5)}` : ""}
                </span>
                <span
                    className={
                        SESSIONS_PAGE_TYPE_BADGE[session.session_type] ??
                        cn(SESSIONS_PAGE_META_BADGE, "border-border/60 bg-muted/30 text-muted-foreground")
                    }
                >
                    {SESSIONS_PAGE_TYPE_LABEL[session.session_type] ?? session.session_type}
                </span>
                <span className={sessionsPageStatusBadgeClass(session.status)}>
                    {sessionsPageStatusLabel(session.status)}
                </span>
                <span className={SESSIONS_PAGE_LIST_ITEM_META}>
                    {session.exercises_count} ejerc.
                    {session.planned_duration != null ? ` · ${session.planned_duration} min` : ""}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className={SESSIONS_PAGE_EDIT_BTN}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    aria-label="Editar sesión"
                >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                </Button>
            </div>
        </article>
    );
};
