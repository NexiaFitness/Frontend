/**
 * TestHistoryModal — historial de resultados por protocolo (test_id).
 */

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { useGetClientTestResultsQuery } from "@nexia/shared/api/clientsApi";
import {
    TESTING_BASELINE_BADGE,
    TESTING_HISTORY_MODAL_TITLE,
    TESTING_HISTORY_ROW,
    TESTING_RESULT_ICON_BTN,
    TESTING_RESULT_ICON_BTN_DANGER,
    formatTestingDate,
} from "../clientTestingPresentation";

interface TestHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    testId: number | null;
    testName: string;
    onEdit: (resultId: number) => void;
    onDelete: (resultId: number, testName: string) => void;
}

export const TestHistoryModal: React.FC<TestHistoryModalProps> = ({
    isOpen,
    onClose,
    clientId,
    testId,
    testName,
    onEdit,
    onDelete,
}) => {
    const { data: results = [], isLoading } = useGetClientTestResultsQuery(
        { clientId, testId: testId ?? undefined },
        { skip: !isOpen || testId == null },
    );

    const sorted = [...results].sort(
        (a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime(),
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={TESTING_HISTORY_MODAL_TITLE}
            description={testName}
            maxWidth="lg"
        >
            {isLoading ? (
                <div className="flex min-h-[8rem] items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            ) : sorted.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay registros para este protocolo.</p>
            ) : (
                <ul className="max-h-[min(24rem,60vh)] space-y-2 overflow-y-auto pr-1">
                    {sorted.map((row) => (
                        <li key={row.id} className={TESTING_HISTORY_ROW}>
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                        {row.value} {row.unit}
                                    </span>
                                    {row.is_baseline && (
                                        <Badge variant="secondary" className="text-xs">
                                            {TESTING_BASELINE_BADGE}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatTestingDate(row.test_date)}
                                    {row.notes ? ` · ${row.notes}` : ""}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-0.5">
                                <button
                                    type="button"
                                    className={TESTING_RESULT_ICON_BTN}
                                    aria-label="Editar"
                                    onClick={() => {
                                        onClose();
                                        onEdit(row.id);
                                    }}
                                >
                                    <Pencil className="size-4" aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    className={TESTING_RESULT_ICON_BTN_DANGER}
                                    aria-label="Eliminar"
                                    onClick={() => {
                                        onClose();
                                        onDelete(row.id, testName);
                                    }}
                                >
                                    <Trash2 className="size-4" aria-hidden />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </BaseModal>
    );
};
