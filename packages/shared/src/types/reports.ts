/**
 * reports.ts — Tipos para sistema de generación de reportes
 *
 * Contexto:
 * - Alineado 100% con backend schemas
 * - ReportRequest, ReportResponse, ReportType
 * - Usado por página GenerateReports
 *
 * Endpoints:
 * - POST /api/v1/reports/generate
 *
 * @author Frontend Team
 * @since v5.1.0
 */

// ========================================
// ENUMS
// ========================================

export const REPORT_TYPE = {
    CLIENT_PROGRESS: "client_progress",
    TRAINING_SUMMARY: "training_summary",
    BILLING_SUMMARY: "billing_summary",
    ATTENDANCE_REPORT: "attendance_report",
} as const;

export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];

export const REPORT_FORMAT = {
    JSON: "json",
    PDF: "pdf",
} as const;

export type ReportFormat = (typeof REPORT_FORMAT)[keyof typeof REPORT_FORMAT];

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface ReportRequest {
    report_type: ReportType;
    client_id?: number | null;
    trainer_id?: number | null;
    start_date?: string | null; // ISO date string
    end_date?: string | null; // ISO date string
    format?: ReportFormat;
}

export interface ReportResponse {
    report_id: string;
    report_type: string;
    generated_at: string; // ISO datetime
    download_url: string | null;
    data: Record<string, unknown> | null;
}

// ========================================
// UI TYPES
// ========================================

export interface ReportFormData {
    reportType: ReportType;
    clientId?: number | null;
    trainerId?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    format: ReportFormat;
}


