/**
 * reportsApi.ts — API de generación de reportes usando RTK Query
 * 
 * Endpoints:
 * - POST /api/v1/reports/generate
 * 
 * @author Frontend Team
 * @since v5.1.0
 */

import { baseApi } from "./baseApi";
import type { ReportRequest, ReportResponse } from "../types/reports";

export const reportsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Generar un reporte
         * Backend: POST /api/v1/reports/generate
         */
        generateReport: builder.mutation<ReportResponse, ReportRequest>({
            query: (reportRequest) => ({
                url: "/reports/generate",
                method: "POST",
                body: reportRequest,
            }),
            invalidatesTags: ["Report"],
        }),
    }),
});

export const { useGenerateReportMutation } = reportsApi;

