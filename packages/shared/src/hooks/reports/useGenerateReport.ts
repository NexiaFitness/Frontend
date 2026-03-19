/**
 * useGenerateReport.ts — Hook para generación de reportes
 *
 * Contexto:
 * - Encapsula la lógica de generación de reportes
 * - Maneja estados de carga y errores
 * - Transforma datos del formulario al formato del backend
 *
 * Uso:
 * ```tsx
 * const { generateReport, isLoading, isError } = useGenerateReport();
 * ```
 *
 * @author Frontend Team
 * @since v5.1.0
 */

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useGenerateReportMutation } from "../../api/reportsApi";
import { useGetCurrentTrainerProfileQuery } from "../../api/trainerApi";
import type { ReportFormData, ReportResponse } from "../../types/reports";
import type { RootState } from "../../store";

interface UseGenerateReportResult {
    generateReport: (formData: ReportFormData) => Promise<ReportResponse>;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    trainerId: number | null;
}

export const useGenerateReport = (): UseGenerateReportResult => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [generateReportMutation, { isLoading, isError, error }] = useGenerateReportMutation();
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const generateReport = useCallback(
        async (formData: ReportFormData): Promise<ReportResponse> => {
            const request = {
                report_type: formData.reportType,
                client_id: formData.clientId ?? null,
                trainer_id: formData.trainerId ?? trainerProfile?.id ?? null,
                start_date: formData.startDate ?? null,
                end_date: formData.endDate ?? null,
                format: formData.format,
            };

            const result = await generateReportMutation(request).unwrap();
            return result;
        },
        [generateReportMutation, trainerProfile]
    );

    return {
        generateReport,
        isLoading,
        isError,
        error,
        trainerId: trainerProfile?.id ?? null,
    };
};


