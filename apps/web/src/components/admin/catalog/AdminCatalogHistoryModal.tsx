/**
 * AdminCatalogHistoryModal.tsx — Historial de la ficha de ejercicio.
 *
 * Contexto: GET .../history entrega cada cambio ya legible (servidor,
 * `catalog_change_log_readable`): palabras del Excel, nombres en español, quién lo hizo y
 * sin procedencia. Aquí solo se compone el diálogo premium (NexiaPremiumModal, tarjetas
 * glass con rim; DESIGN_PREMIUM §5.1). El formato de cada tarjeta vive en
 * `adminCatalogHistoryPresentation.ts`.
 * Notas de mantenimiento: ninguna lógica de traducción en el componente. Una entrada que el
 * servidor no puede detallar se muestra igualmente: el historial no esconde cambios.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import React, { useMemo } from "react";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { NexiaPremiumModal } from "@/components/ui/modals";
import { useGetCatalogExerciseHistoryQuery } from "@nexia/shared/api/adminCatalogApi";

import { ADMIN_CATALOG_COPY } from "./adminCatalogPresentation";
import {
    ADMIN_CATALOG_HISTORY_CLOSE,
    ADMIN_CATALOG_HISTORY_EMPTY,
    ADMIN_CATALOG_HISTORY_FOOTER,
    ADMIN_CATALOG_HISTORY_ITEM,
    ADMIN_CATALOG_HISTORY_LINE,
    ADMIN_CATALOG_HISTORY_LINES,
    ADMIN_CATALOG_HISTORY_LIST,
    ADMIN_CATALOG_HISTORY_META,
    ADMIN_CATALOG_HISTORY_STATUS,
    ADMIN_CATALOG_HISTORY_STATUS_TEXT,
    ADMIN_CATALOG_HISTORY_TITLE,
    catalogHistoryEntryView,
} from "./adminCatalogHistoryPresentation";

export interface AdminCatalogHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercisePk: number | null;
    exerciseName?: string;
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
    const entries = useMemo(
        () => (data?.entries ?? []).map(catalogHistoryEntryView),
        [data?.entries]
    );

    const title = exerciseName
        ? `${ADMIN_CATALOG_COPY.historyTitle} — ${exerciseName}`
        : ADMIN_CATALOG_COPY.historyTitle;
    const ready = !isLoading && !isError;

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="xl"
            data-testid="admin-catalog-history-modal"
            footer={
                <div className={ADMIN_CATALOG_HISTORY_FOOTER}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        className={ADMIN_CATALOG_HISTORY_CLOSE}
                        onClick={onClose}
                    >
                        {ADMIN_CATALOG_COPY.conflictClose}
                    </Button>
                </div>
            }
        >
            {isLoading ? (
                <div className={ADMIN_CATALOG_HISTORY_STATUS} aria-busy="true">
                    <LoadingSpinner size="sm" />
                    <span className={ADMIN_CATALOG_HISTORY_STATUS_TEXT}>
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
                            variant="ghost-primary"
                            size="sm"
                            onClick={() => refetch()}
                        >
                            {ADMIN_CATALOG_COPY.retry}
                        </Button>
                    }
                >
                    {ADMIN_CATALOG_COPY.historyError}
                </Alert>
            ) : null}

            {ready && entries.length === 0 ? (
                <p className={ADMIN_CATALOG_HISTORY_EMPTY}>{ADMIN_CATALOG_COPY.historyEmpty}</p>
            ) : null}

            {ready && entries.length > 0 ? (
                <ul className={ADMIN_CATALOG_HISTORY_LIST}>
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className={ADMIN_CATALOG_HISTORY_ITEM}
                            data-testid="admin-catalog-history-entry"
                        >
                            <NexiaGlassAccentRim />
                            <p className={ADMIN_CATALOG_HISTORY_META}>
                                {entry.when} · {entry.actor}
                            </p>
                            <p className={ADMIN_CATALOG_HISTORY_TITLE}>{entry.title}</p>
                            <ul className={ADMIN_CATALOG_HISTORY_LINES}>
                                {entry.lines.map((line, index) => (
                                    <li
                                        key={`${entry.id}-${index}`}
                                        className={ADMIN_CATALOG_HISTORY_LINE}
                                    >
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : null}
        </NexiaPremiumModal>
    );
};
