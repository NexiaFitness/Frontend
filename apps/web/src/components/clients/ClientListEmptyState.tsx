/**
 * ClientListEmptyState — Empty state glass premium lista clientes.
 */

import React from "react";
import { UserPlus } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    CLIENT_LIST_EMPTY_BODY,
    CLIENT_LIST_EMPTY_GLOW,
    CLIENT_LIST_EMPTY_SHELL,
    CLIENT_LIST_EMPTY_TITLE,
    CLIENT_LIST_COPY,
} from "./clientListPresentation";
import { ATHLETE_EMPTY_STATE_ICON_WRAP } from "@/components/athlete/empty/athleteEmptyStatePresentation";

export interface ClientListEmptyStateProps {
    action?: React.ReactNode;
    className?: string;
}

export const ClientListEmptyState: React.FC<ClientListEmptyStateProps> = ({ action, className }) => (
    <div className={cn(CLIENT_LIST_EMPTY_SHELL, className)} role="status">
        <NexiaGlassAccentRim />
        <div className={CLIENT_LIST_EMPTY_GLOW} aria-hidden />
        <div className={ATHLETE_EMPTY_STATE_ICON_WRAP}>
            <UserPlus className="size-6" aria-hidden />
        </div>
        <h2 className={cn(CLIENT_LIST_EMPTY_TITLE, "relative z-[1]")}>{CLIENT_LIST_COPY.emptyTitle}</h2>
        <p className={cn(CLIENT_LIST_EMPTY_BODY, "relative z-[1]")}>{CLIENT_LIST_COPY.emptyBody}</p>
        {action ? <div className="relative z-[1] mt-5 w-full max-w-xs">{action}</div> : null}
    </div>
);
