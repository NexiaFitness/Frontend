/**
 * Selector P-A cuando hay varias sesiones de entrenamiento el mismo día (tab Sesiones).
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import { labelSessionDayCoexistenceItem } from "@nexia/shared/training/sessionDayCoexistenceCopy";
import { NexiaPremiumModal } from "@/components/ui/modals";
import { cn } from "@/lib/utils";

export interface ClientDaySessionsPickerSheetProps {
    isOpen: boolean;
    dateLabel: string;
    sessions: SessionListItem[];
    onClose: () => void;
    onSelect: (session: SessionListItem) => void;
}

export const ClientDaySessionsPickerSheet: React.FC<ClientDaySessionsPickerSheetProps> = ({
    isOpen,
    dateLabel,
    sessions,
    onClose,
    onSelect,
}) => (
    <NexiaPremiumModal
        isOpen={isOpen}
        onClose={onClose}
        title="Sesiones este día"
        description={dateLabel}
        maxWidth="md"
        data-testid="client-day-sessions-picker"
    >
        <ul className="space-y-2" role="listbox" aria-label="Sesiones del día">
            {sessions.map((session) => (
                <li key={`${session.session_kind}-${session.id}`}>
                    <button
                        type="button"
                        role="option"
                        className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-lg border border-border/60",
                            "bg-surface-2 px-4 py-3 text-left text-sm text-foreground",
                            "transition-colors hover:border-primary/40 hover:bg-surface-3",
                        )}
                        onClick={() => onSelect(session)}
                    >
                        <span className="min-w-0 font-medium leading-snug">
                            {labelSessionDayCoexistenceItem({
                                session_kind: session.session_kind,
                                session_name: session.session_name,
                            })}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    </button>
                </li>
            ))}
        </ul>
    </NexiaPremiumModal>
);
