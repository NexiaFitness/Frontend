/**
 * TrainerInboxPanel.tsx — Panel lateral inbox (cliente o global).
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTrainerInbox } from "@nexia/shared/hooks/dashboard/useTrainerInbox";
import type { ClientInboxItem } from "@nexia/shared/types/notification";
import { getInboxItemBorderClass } from "@nexia/shared/utils/trainer/trainerInboxUtils";
import { SidePanel } from "@/components/ui/layout/SidePanel";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";
import {
    CLIENT_INBOX_ITEM_BODY,
    CLIENT_INBOX_ITEM_CARD,
    CLIENT_INBOX_ITEM_META,
    CLIENT_INBOX_ITEM_TITLE,
    CLIENT_INBOX_PANEL_HEADER,
    CLIENT_INBOX_TAB_ACTIVE,
    CLIENT_INBOX_TAB_BUTTON,
    CLIENT_INBOX_TAB_INACTIVE,
} from "./clientInboxPresentation";

type InboxTab = "pending" | "all";

export interface TrainerInboxPanelProps {
    isOpen: boolean;
    onClose: () => void;
    /** Si se omite, muestra inbox global (todos los clientes). */
    clientId?: number;
    title?: string;
    subtitle?: string;
}

function formatRelativeDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function InboxItemRow({
    item,
    showClientHint,
    onSelect,
}: {
    item: ClientInboxItem;
    showClientHint: boolean;
    onSelect: (item: ClientInboxItem) => void;
}) {
    return (
        <button
            type="button"
            className={cn(CLIENT_INBOX_ITEM_CARD, getInboxItemBorderClass(item.priority))}
            onClick={() => onSelect(item)}
            data-testid={`trainer-inbox-item-${item.notificationId}`}
        >
            <p className={CLIENT_INBOX_ITEM_TITLE}>{item.title}</p>
            <p className={CLIENT_INBOX_ITEM_BODY}>{item.body}</p>
            <p className={CLIENT_INBOX_ITEM_META}>
                {formatRelativeDate(item.createdAt)}
                {showClientHint && item.clientId > 0 && ` · Cliente #${item.clientId}`}
                {!item.isRead && " · Sin leer"}
                {item.isResolved && " · Resuelto"}
            </p>
        </button>
    );
}

export const TrainerInboxPanel: React.FC<TrainerInboxPanelProps> = ({
    isOpen,
    onClose,
    clientId,
    title = "Bandeja de entrada",
    subtitle = "Notificaciones y acciones pendientes",
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<InboxTab>("pending");
    const {
        items,
        pendingItems,
        isLoading,
        markAsRead,
        markAllAsRead,
        isFetching,
    } = useTrainerInbox({ clientId, enabled: isOpen });

    const visibleItems = activeTab === "pending" ? pendingItems : items;
    const showClientHint = clientId == null;
    const panelLabel = clientId != null ? "Bandeja de entrada del cliente" : "Notificaciones globales";

    const handleSelectItem = async (item: ClientInboxItem) => {
        if (!item.isRead) {
            try {
                await markAsRead(item.notificationId);
            } catch {
                /* navigation still proceeds */
            }
        }
        onClose();
        navigate(item.deepLink);
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
        } catch {
            /* ignore */
        }
    };

    return (
        <SidePanel isOpen={isOpen} onClose={onClose} ariaLabel={panelLabel}>
            <div className={CLIENT_INBOX_PANEL_HEADER}>
                <div className="min-w-0">
                    <h2 className={TYPOGRAPHY.modalTitle}>{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    aria-label="Cerrar bandeja"
                >
                    <X className="size-5" aria-hidden />
                </button>
            </div>

            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <div className="flex flex-1 gap-1 rounded-lg bg-surface p-1">
                    <button
                        type="button"
                        className={cn(
                            CLIENT_INBOX_TAB_BUTTON,
                            activeTab === "pending"
                                ? CLIENT_INBOX_TAB_ACTIVE
                                : CLIENT_INBOX_TAB_INACTIVE,
                        )}
                        onClick={() => setActiveTab("pending")}
                    >
                        Pendientes ({pendingItems.length})
                    </button>
                    <button
                        type="button"
                        className={cn(
                            CLIENT_INBOX_TAB_BUTTON,
                            activeTab === "all" ? CLIENT_INBOX_TAB_ACTIVE : CLIENT_INBOX_TAB_INACTIVE,
                        )}
                        onClick={() => setActiveTab("all")}
                    >
                        Todas ({items.length})
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-end border-b border-border px-5 py-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={isFetching}
                >
                    Marcar todo como leído
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                {isLoading ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <LoadingSpinner size="md" />
                    </div>
                ) : visibleItems.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        {activeTab === "pending"
                            ? "No hay acciones pendientes."
                            : "No hay notificaciones todavía."}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {visibleItems.map((item) => (
                            <InboxItemRow
                                key={item.id}
                                item={item}
                                showClientHint={showClientHint}
                                onSelect={handleSelectItem}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SidePanel>
    );
};
