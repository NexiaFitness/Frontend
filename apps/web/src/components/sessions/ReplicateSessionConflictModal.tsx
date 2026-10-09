/**
 * ReplicateSessionConflictModal — Conflictos al replicar sesión (NexiaPremiumModal).
 *
 * Contexto: D-REP-1 (docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/).
 * Solo las sesiones sustituibles se ofrecen para sustituir; las ya entrenadas se
 * listan aparte como informativas y nunca se tocan.
 */

import React from "react";
import { Lock, TriangleAlert } from "lucide-react";

import type { SkippedConflictItem } from "@nexia/shared/types/trainingSessions";

import { Button } from "@/components/ui/buttons";
import {
    NexiaPremiumModal,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS,
} from "@/components/ui/modals";
import { cn } from "@/lib/utils";

import {
    REPLICATE_CONFLICT_KEEP_LABEL,
    REPLICATE_CONFLICT_PROTECTED_TITLE,
    REPLICATE_CONFLICT_REPLACE_HINT,
    REPLICATE_CONFLICT_REPLACE_LABEL,
    formatReplicationDate,
    type ReplicateConflictOutcome,
} from "./replicateSessionPresentation";

interface ReplicateSessionConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmReplace: () => void;
    outcome: ReplicateConflictOutcome;
    isLoading: boolean;
}

const ConflictRow: React.FC<{ item: SkippedConflictItem; isProtected: boolean }> = ({
    item,
    isProtected,
}) => (
    <li
        className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5",
            isProtected ? "bg-muted/40" : "bg-warning/5",
        )}
    >
        {isProtected ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
            <TriangleAlert className="h-4 w-4 shrink-0 text-warning" aria-hidden />
        )}
        <span className="text-sm font-medium text-foreground">
            Semana {item.week_ordinal}
        </span>
        {item.existing_session_name ? (
            <span className="truncate text-xs text-muted-foreground">
                {item.existing_session_name}
            </span>
        ) : null}
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {formatReplicationDate(item.session_date)}
        </span>
    </li>
);

export const ReplicateSessionConflictModal: React.FC<
    ReplicateSessionConflictModalProps
> = ({ isOpen, onClose, onConfirmReplace, outcome, isLoading }) => (
    <NexiaPremiumModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="lg"
        closeOnBackdrop={!isLoading}
        closeOnEsc={!isLoading}
        title="Semanas que ya tienen sesión"
        description={`Se replicaron ${outcome.createdCount} sesiones. En estas semanas ya hay una sesión planificada en el mismo día y hora:`}
        footer={
            <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                <div className={NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {REPLICATE_CONFLICT_KEEP_LABEL}
                    </Button>
                    <Button
                        type="button"
                        variant="outline-destructive"
                        onClick={onConfirmReplace}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className={cn("flex-1 sm:flex-none")}
                    >
                        {REPLICATE_CONFLICT_REPLACE_LABEL}
                    </Button>
                </div>
            </div>
        }
    >
        <div className="space-y-4">
            <ul className="space-y-2 rounded-lg border border-border/50 p-3">
                {outcome.replaceable.map((item) => (
                    <ConflictRow
                        key={`replaceable-${item.week_ordinal}`}
                        item={item}
                        isProtected={false}
                    />
                ))}
            </ul>
            {outcome.protectedItems.length > 0 ? (
                <section aria-labelledby="replicate-protected-title" className="space-y-2">
                    <h3
                        id="replicate-protected-title"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                        {REPLICATE_CONFLICT_PROTECTED_TITLE}
                    </h3>
                    <ul className="space-y-2 rounded-lg border border-border/50 p-3">
                        {outcome.protectedItems.map((item) => (
                            <ConflictRow
                                key={`protected-${item.week_ordinal}`}
                                item={item}
                                isProtected
                            />
                        ))}
                    </ul>
                </section>
            ) : null}
            <p className="text-sm text-muted-foreground">{REPLICATE_CONFLICT_REPLACE_HINT}</p>
        </div>
    </NexiaPremiumModal>
);
