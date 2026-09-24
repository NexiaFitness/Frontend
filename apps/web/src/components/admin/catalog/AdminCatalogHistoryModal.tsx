/**
 * AdminCatalogHistoryModal.tsx — Historial de cambios por ejercicio (GET .../history).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { NexiaPremiumModal } from "@/components/ui/modals";
import { useGetCatalogExerciseHistoryQuery } from "@nexia/shared/api/adminCatalogApi";
import {
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_HISTORY_ITEM,
    ADMIN_CATALOG_HISTORY_LIST,
    ADMIN_CATALOG_HISTORY_META,
} from "./adminCatalogPresentation";

export interface AdminCatalogHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercisePk: number | null;
    exerciseName?: string;
}

function formatWhen(iso: string): string {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

export const AdminCatalogHistoryModal: React.FC<AdminCatalogHistoryModalProps> = ({
    isOpen,
    onClose,
    exercisePk,
    exerciseName,
}) => {
    const { data, isLoading, isError, refetch } = useGetCatalogExerciseHistoryQuery(
        exercisePk ?? 0,
        { skip: !isOpen || exercisePk == null }
    );

    const title = exerciseName
        ? `${ADMIN_CATALOG_COPY.historyTitle} — ${exerciseName}`
        : ADMIN_CATALOG_COPY.historyTitle;

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="xl"
            data-testid="admin-catalog-history-modal"
            footer={
                <Button type="button" variant="ghost-primary" size="sm" onClick={onClose}>
                    {ADMIN_CATALOG_COPY.conflictClose}
                </Button>
            }
        >
            {isLoading ? (
                <div className="flex items-center gap-3 py-8">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">
                        {ADMIN_CATALOG_COPY.historyLoading}
                    </span>
                </div>
            ) : null}

            {isError ? (
                <Alert
                    variant="error"
                    action={
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => refetch()}
                        >
                            Reintentar
                        </Button>
                    }
                >
                    {ADMIN_CATALOG_COPY.historyError}
                </Alert>
            ) : null}

            {!isLoading && !isError && (data?.entries.length ?? 0) === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                    {ADMIN_CATALOG_COPY.historyEmpty}
                </p>
            ) : null}

            {!isLoading && !isError && (data?.entries.length ?? 0) > 0 ? (
                <ul className={ADMIN_CATALOG_HISTORY_LIST}>
                    {data?.entries.map((entry) => (
                        <li key={entry.id} className={ADMIN_CATALOG_HISTORY_ITEM}>
                            <p className={ADMIN_CATALOG_HISTORY_META}>
                                {formatWhen(entry.created_at)} · {entry.actor_label}
                            </p>
                            <p className="font-medium text-foreground">{entry.field_path}</p>
                            <p className="text-muted-foreground">
                                {entry.old_value ?? "—"} → {entry.new_value ?? "—"}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : null}
        </NexiaPremiumModal>
    );
};
