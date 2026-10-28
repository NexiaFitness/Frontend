/**
 * ClientProgressRecordsSection.tsx — «Registros antropométricos» de la pestaña Progreso:
 * lista de peso, IMC y notas, con alta y edición.
 *
 * Contexto: extraído de ClientProgressTab (fichero ya fuera del límite de líneas).
 * Lee el alcance de la vista con useClientViewScope: en solo lectura (vista supervisada
 * del admin) no ofrece alta, edición ni el formulario.
 *
 * Notas de mantenimiento: el refetch tras editar lo decide el padre (onRecordUpdated);
 * el alta invalida su propia caché desde ProgressForm.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardList, Pencil, Plus, X } from "lucide-react";
import type { ClientProgress } from "@nexia/shared/types/progress";
import { Button } from "@/components/ui/buttons";
import { EmptyState } from "@/components/ui/feedback";
import { ProgressForm } from "./ProgressForm";
import { EditProgressModal } from "../modals/EditProgressModal";
import { useClientViewScope } from "./clientViewScope";
import {
    PROGRESS_RECORDS_COPY,
    PROGRESS_RECORDS_EDIT_BUTTON,
    PROGRESS_RECORDS_EMPTY,
    PROGRESS_RECORDS_FORM_CARD,
    PROGRESS_RECORDS_FORM_TITLE,
    PROGRESS_RECORDS_HEADER,
    PROGRESS_RECORDS_LIST,
    PROGRESS_RECORDS_ROW,
    PROGRESS_RECORDS_ROW_BODY,
    PROGRESS_RECORDS_ROW_DATE,
    PROGRESS_RECORDS_ROW_METRICS,
    PROGRESS_RECORDS_ROW_NOTES,
    PROGRESS_RECORDS_ROW_VALUE,
    PROGRESS_RECORDS_SECTION,
    PROGRESS_RECORDS_SUBTITLE,
    PROGRESS_RECORDS_TITLE,
} from "./clientProgressRecordsPresentation";

export interface ClientProgressRecordsSectionProps {
    clientId: number;
    records: ClientProgress[] | undefined;
    onRecordUpdated: () => void;
}

function formatRecordDate(value: string): string {
    return new Date(value).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export const ClientProgressRecordsSection: React.FC<ClientProgressRecordsSectionProps> = ({
    clientId,
    records,
    onRecordUpdated,
}) => {
    const { readOnly } = useClientViewScope();
    const [showForm, setShowForm] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ClientProgress | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const hasRecords = records != null && records.length > 0;

    const closeModal = useCallback(() => setSelectedRecord(null), []);
    const handleEditSuccess = useCallback(() => {
        onRecordUpdated();
        setSelectedRecord(null);
    }, [onRecordUpdated]);

    useEffect(() => {
        if (!showForm || !formRef.current) return;
        const timer = setTimeout(
            () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
            100,
        );
        return () => clearTimeout(timer);
    }, [showForm]);

    return (
        <div className={PROGRESS_RECORDS_SECTION}>
            <div className={PROGRESS_RECORDS_HEADER}>
                <div>
                    <h3 className={PROGRESS_RECORDS_TITLE}>{PROGRESS_RECORDS_COPY.title}</h3>
                    <p className={PROGRESS_RECORDS_SUBTITLE}>{PROGRESS_RECORDS_COPY.subtitle}</p>
                </div>
                {!readOnly && hasRecords && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowForm((v) => !v)}
                        className="shrink-0"
                    >
                        {showForm ? <X className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
                        {showForm ? PROGRESS_RECORDS_COPY.cancel : PROGRESS_RECORDS_COPY.newRecord}
                    </Button>
                )}
            </div>

            {!readOnly && showForm && (
                <div ref={formRef} className={PROGRESS_RECORDS_FORM_CARD}>
                    <p className={PROGRESS_RECORDS_FORM_TITLE}>{PROGRESS_RECORDS_COPY.formTitle}</p>
                    <ProgressForm clientId={clientId} />
                </div>
            )}

            {hasRecords ? (
                <div className={PROGRESS_RECORDS_LIST}>
                    {records.map((record) => (
                        <div key={record.id} className={PROGRESS_RECORDS_ROW}>
                            <div className={PROGRESS_RECORDS_ROW_BODY}>
                                <p className={PROGRESS_RECORDS_ROW_DATE}>
                                    {formatRecordDate(record.fecha_registro)}
                                </p>
                                <div className={PROGRESS_RECORDS_ROW_METRICS}>
                                    <span>
                                        {PROGRESS_RECORDS_COPY.weight}:{" "}
                                        <strong className={PROGRESS_RECORDS_ROW_VALUE}>
                                            {record.peso ? `${record.peso} kg` : "—"}
                                        </strong>
                                    </span>
                                    <span>
                                        {PROGRESS_RECORDS_COPY.bmi}:{" "}
                                        <strong className={PROGRESS_RECORDS_ROW_VALUE}>
                                            {record.imc ? record.imc.toFixed(1) : "—"}
                                        </strong>
                                    </span>
                                </div>
                                {record.notas && (
                                    <p className={PROGRESS_RECORDS_ROW_NOTES}>{record.notas}</p>
                                )}
                            </div>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedRecord(record)}
                                    className={PROGRESS_RECORDS_EDIT_BUTTON}
                                    title={PROGRESS_RECORDS_COPY.editRecord}
                                    aria-label={PROGRESS_RECORDS_COPY.editRecord}
                                >
                                    <Pencil className="h-4 w-4" aria-hidden />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className={PROGRESS_RECORDS_EMPTY} data-testid="progress-history-empty">
                    <EmptyState
                        icon={<ClipboardList />}
                        title={PROGRESS_RECORDS_COPY.emptyTitle}
                        description={
                            readOnly
                                ? PROGRESS_RECORDS_COPY.emptyDescriptionReadOnly
                                : PROGRESS_RECORDS_COPY.emptyDescription
                        }
                        action={
                            !readOnly && !showForm ? (
                                <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                                    <Plus className="size-4" aria-hidden />
                                    {PROGRESS_RECORDS_COPY.addFirst}
                                </Button>
                            ) : undefined
                        }
                    />
                </div>
            )}

            {!readOnly && selectedRecord && (
                <EditProgressModal
                    isOpen
                    onClose={closeModal}
                    progressRecord={selectedRecord}
                    clientId={clientId}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};
