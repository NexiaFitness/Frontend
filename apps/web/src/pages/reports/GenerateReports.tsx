/**
 * GenerateReports.tsx — Página de generación de reportes
 *
 * Contexto:
 * - Vista protegida (solo trainers) para generar reportes
 * - Permite seleccionar tipo de reporte, cliente, fechas y formato
 * - Muestra resultado del reporte generado
 *
 * @author Frontend Team
 * @since v5.1.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { Input, FormSelect } from "@/components/ui/forms";
import { useGenerateReport } from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import type { ReportFormData, ReportType, ReportFormat } from "@nexia/shared/types/reports";
import { REPORT_TYPE, REPORT_FORMAT } from "@nexia/shared/types/reports";

export const GenerateReports: React.FC = () => {
    const navigate = useNavigate();
    const { generateReport, isLoading, isError, error, trainerId } = useGenerateReport();

    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId: trainerId ?? 0, page: 1, per_page: 100 },
        { skip: !trainerId }
    );

    const [formData, setFormData] = useState<ReportFormData>({
        reportType: REPORT_TYPE.CLIENT_PROGRESS,
        clientId: null,
        trainerId: trainerId ?? null,
        startDate: null,
        endDate: null,
        format: REPORT_FORMAT.JSON,
    });

    const [reportResult, setReportResult] = useState<{ report_id: string; data: Record<string, unknown> | null } | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setReportResult(null);

        // Validación
        const errors: Record<string, string> = {};
        if (formData.reportType === REPORT_TYPE.CLIENT_PROGRESS && !formData.clientId) {
            errors.clientId = "Se requiere seleccionar un cliente para este tipo de reporte";
        }
        if (formData.reportType === REPORT_TYPE.TRAINING_SUMMARY && !formData.trainerId) {
            errors.trainerId = "Se requiere trainer_id para este tipo de reporte";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const result = await generateReport(formData);
            setReportResult({
                report_id: result.report_id,
                data: result.data,
            });
        } catch (err) {
            console.error("Error generando reporte:", err);
        }
    };

    return (
        <>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Generar Reportes
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Genera reportes detallados de progreso, entrenamientos y estadísticas
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">

                    {/* Formulario */}
                    <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 mb-6">
                        <h3 className="text-lg lg:text-xl font-bold text-foreground mb-6">Configuración del Reporte</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tipo de Reporte */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Tipo de Reporte *
                                </label>
                                <FormSelect
                                    value={formData.reportType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, reportType: e.target.value as ReportType })
                                    }
                                    required
                                    options={[
                                        { value: REPORT_TYPE.CLIENT_PROGRESS, label: "Progreso del Cliente" },
                                        { value: REPORT_TYPE.TRAINING_SUMMARY, label: "Resumen de Entrenamientos" },
                                        { value: REPORT_TYPE.BILLING_SUMMARY, label: "Resumen de Facturación (Próximamente)", disabled: true },
                                        { value: REPORT_TYPE.ATTENDANCE_REPORT, label: "Reporte de Asistencia (Próximamente)", disabled: true },
                                    ]}
                                />
                            </div>

                            {/* Cliente (si aplica) */}
                            {formData.reportType === REPORT_TYPE.CLIENT_PROGRESS && (
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Cliente *
                                    </label>
                                    <FormSelect
                                        value={formData.clientId?.toString() ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                clientId: e.target.value ? Number(e.target.value) : null,
                                            })
                                        }
                                        required
                                        options={[
                                            { value: "", label: "Seleccionar cliente" },
                                            ...(clientsData?.items.map((client) => ({
                                                value: client.id.toString(),
                                                label: `${client.nombre} ${client.apellidos}`,
                                            })) ?? []),
                                        ]}
                                    />
                                    {formErrors.clientId && (
                                        <p className="text-destructive text-xs mt-1">{formErrors.clientId}</p>
                                    )}
                                </div>
                            )}

                            {/* Fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Fecha Inicio
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.startDate ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, startDate: e.target.value || null })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Fecha Fin
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.endDate ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, endDate: e.target.value || null })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Formato */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Formato
                                </label>
                                <FormSelect
                                    value={formData.format}
                                    onChange={(e) =>
                                        setFormData({ ...formData, format: e.target.value as ReportFormat })
                                    }
                                    options={[
                                        { value: REPORT_FORMAT.JSON, label: "JSON" },
                                        { value: REPORT_FORMAT.PDF, label: "PDF (Próximamente)", disabled: true },
                                    ]}
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" variant="primary" disabled={isLoading}>
                                    {isLoading ? "Generando..." : "Generar Reporte"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>

                        {/* Error */}
                        {isError && (
                            <div className="mt-6">
                                <Alert variant="error">
                                    {error && typeof error === "object" && "data" in error
                                        ? String((error as { data: unknown }).data)
                                        : "Error al generar el reporte"}
                                </Alert>
                            </div>
                        )}
                    </div>

                    {/* Resultado */}
                    {reportResult && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4">Reporte Generado</h3>
                            <div className="mb-4">
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold">ID del Reporte:</span> {reportResult.report_id}
                                </p>
                            </div>
                            {reportResult.data && (
                                <div className="bg-muted rounded-lg p-4 overflow-auto max-h-96">
                                    <pre className="text-xs text-foreground whitespace-pre-wrap">
                                        {JSON.stringify(reportResult.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
        </>
    );
};

