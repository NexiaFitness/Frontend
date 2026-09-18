/**
 * GenerateReports.tsx — Generación de reportes (premium §5.3).
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import {
    DatePickerButton,
    FormCombobox,
    FormField,
} from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { useGenerateReport } from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import type { ReportFormData, ReportFormat, ReportType } from "@nexia/shared/types/reports";
import { REPORT_FORMAT, REPORT_TYPE } from "@nexia/shared/types/reports";
import {
    GENERATE_REPORTS_BACK_BUTTON,
    GENERATE_REPORTS_BACK_LABEL,
    GENERATE_REPORTS_CANCEL,
    GENERATE_REPORTS_CLIENT_LABEL,
    GENERATE_REPORTS_CLIENT_PLACEHOLDER,
    GENERATE_REPORTS_DATE_GRID,
    GENERATE_REPORTS_END_LABEL,
    GENERATE_REPORTS_ERROR_CLIENT,
    GENERATE_REPORTS_FOOTER_ACTIONS,
    GENERATE_REPORTS_FOOTER_BTN,
    GENERATE_REPORTS_FORMAT_LABEL,
    GENERATE_REPORTS_FORMAT_OPTIONS,
    GENERATE_REPORTS_FORM_BODY,
    GENERATE_REPORTS_FORM_CARD,
    GENERATE_REPORTS_FORM_DIVIDER,
    GENERATE_REPORTS_GLOW,
    GENERATE_REPORTS_HEADER,
    GENERATE_REPORTS_ICON_BACK_GAP,
    GENERATE_REPORTS_ICON_SM,
    GENERATE_REPORTS_PAGE,
    GENERATE_REPORTS_PAGE_SUBTITLE,
    GENERATE_REPORTS_PAGE_TITLE,
    GENERATE_REPORTS_SECTION,
    GENERATE_REPORTS_SECTION_CONFIG,
    GENERATE_REPORTS_SECTION_RESULT,
    GENERATE_REPORTS_SECTION_TITLE,
    GENERATE_REPORTS_START_LABEL,
    GENERATE_REPORTS_SUBMIT,
    GENERATE_REPORTS_SUBMIT_CTA,
    GENERATE_REPORTS_TITLE_WRAP,
    GENERATE_REPORTS_TYPE_LABEL,
    GENERATE_REPORTS_TYPE_OPTIONS,
    GENERATE_REPORTS_UPCOMING_HINT,
} from "./generateReportsPresentation";

const FORM_VARIANT = "premium" as const;

export const GenerateReports: React.FC = () => {
    const navigate = useNavigate();
    const { generateReport, isLoading, isError, error, trainerId } = useGenerateReport();

    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId: trainerId ?? 0, page: 1, per_page: 50 },
        { skip: !trainerId },
    );

    const [formData, setFormData] = useState<ReportFormData>({
        reportType: REPORT_TYPE.CLIENT_PROGRESS,
        clientId: null,
        trainerId: trainerId ?? null,
        startDate: null,
        endDate: null,
        format: REPORT_FORMAT.JSON,
    });

    const [reportResult, setReportResult] = useState<{
        report_id: string;
        data: Record<string, unknown> | null;
    } | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const clientOptions = useMemo(
        () => [
            { value: "", label: GENERATE_REPORTS_CLIENT_PLACEHOLDER },
            ...(clientsData?.items.map((client) => ({
                value: client.id.toString(),
                label: `${client.nombre} ${client.apellidos}`.trim(),
            })) ?? []),
        ],
        [clientsData?.items],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setReportResult(null);

        const errors: Record<string, string> = {};
        if (formData.reportType === REPORT_TYPE.CLIENT_PROGRESS && !formData.clientId) {
            errors.clientId = GENERATE_REPORTS_ERROR_CLIENT;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const result = await generateReport({
                ...formData,
                trainerId: trainerId ?? formData.trainerId,
            });
            setReportResult({
                report_id: result.report_id,
                data: result.data,
            });
        } catch (err) {
            console.error("Error generando reporte:", err);
        }
    };

    return (
        <div className={GENERATE_REPORTS_PAGE}>
            <div className={GENERATE_REPORTS_GLOW} aria-hidden />

            <div className={GENERATE_REPORTS_HEADER}>
                <PageTitle
                    title={GENERATE_REPORTS_PAGE_TITLE}
                    subtitle={GENERATE_REPORTS_PAGE_SUBTITLE}
                    className={GENERATE_REPORTS_TITLE_WRAP}
                />
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={GENERATE_REPORTS_BACK_BUTTON}
                    onClick={() => navigate("/dashboard")}
                >
                    <ArrowLeft
                        className={cn(GENERATE_REPORTS_ICON_BACK_GAP, GENERATE_REPORTS_ICON_SM)}
                        aria-hidden
                    />
                    {GENERATE_REPORTS_BACK_LABEL}
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <article className={GENERATE_REPORTS_FORM_CARD}>
                    <NexiaGlassAccentRim />
                    <div className={GENERATE_REPORTS_FORM_BODY}>
                        <section className={GENERATE_REPORTS_SECTION} aria-label={GENERATE_REPORTS_SECTION_CONFIG}>
                            <h2 className={GENERATE_REPORTS_SECTION_TITLE}>
                                {GENERATE_REPORTS_SECTION_CONFIG}
                            </h2>

                            <FormField label={GENERATE_REPORTS_TYPE_LABEL} required variant={FORM_VARIANT}>
                                <FormCombobox
                                    size="sm"
                                    variant={FORM_VARIANT}
                                    value={formData.reportType}
                                    options={GENERATE_REPORTS_TYPE_OPTIONS}
                                    onChange={(next) =>
                                        setFormData({
                                            ...formData,
                                            reportType: next as ReportType,
                                            clientId:
                                                next === REPORT_TYPE.CLIENT_PROGRESS
                                                    ? formData.clientId
                                                    : null,
                                        })
                                    }
                                    ariaLabel={GENERATE_REPORTS_TYPE_LABEL}
                                />
                                <p className={GENERATE_REPORTS_UPCOMING_HINT}>
                                    Facturación y asistencia — próximamente.
                                </p>
                            </FormField>

                            {formData.reportType === REPORT_TYPE.CLIENT_PROGRESS && (
                                <FormField label={GENERATE_REPORTS_CLIENT_LABEL} required variant={FORM_VARIANT}>
                                    <FormCombobox
                                        size="sm"
                                        variant={FORM_VARIANT}
                                        value={formData.clientId?.toString() ?? ""}
                                        options={clientOptions}
                                        onChange={(next) =>
                                            setFormData({
                                                ...formData,
                                                clientId: next ? Number(next) : null,
                                            })
                                        }
                                        placeholder={GENERATE_REPORTS_CLIENT_PLACEHOLDER}
                                        ariaLabel={GENERATE_REPORTS_CLIENT_LABEL}
                                    />
                                    {formErrors.clientId ? (
                                        <p className="text-sm text-destructive">{formErrors.clientId}</p>
                                    ) : null}
                                </FormField>
                            )}

                            <div className={GENERATE_REPORTS_DATE_GRID}>
                                <FormField label={GENERATE_REPORTS_START_LABEL} variant={FORM_VARIANT}>
                                    <DatePickerButton
                                        variant="form"
                                        controlVariant={FORM_VARIANT}
                                        label="Elegir fecha inicio"
                                        value={formData.startDate ?? ""}
                                        onChange={(next) =>
                                            setFormData({ ...formData, startDate: next || null })
                                        }
                                    />
                                </FormField>
                                <FormField label={GENERATE_REPORTS_END_LABEL} variant={FORM_VARIANT}>
                                    <DatePickerButton
                                        variant="form"
                                        controlVariant={FORM_VARIANT}
                                        label="Elegir fecha fin"
                                        value={formData.endDate ?? ""}
                                        onChange={(next) =>
                                            setFormData({ ...formData, endDate: next || null })
                                        }
                                    />
                                </FormField>
                            </div>

                            <FormField label={GENERATE_REPORTS_FORMAT_LABEL} variant={FORM_VARIANT}>
                                <FormCombobox
                                    size="sm"
                                    variant={FORM_VARIANT}
                                    value={formData.format}
                                    options={GENERATE_REPORTS_FORMAT_OPTIONS}
                                    onChange={(next) =>
                                        setFormData({ ...formData, format: next as ReportFormat })
                                    }
                                    ariaLabel={GENERATE_REPORTS_FORMAT_LABEL}
                                />
                                <p className={GENERATE_REPORTS_UPCOMING_HINT}>PDF — próximamente.</p>
                            </FormField>
                        </section>

                        {isError ? (
                            <Alert variant="error">
                                {error && typeof error === "object" && "data" in error
                                    ? String((error as { data: unknown }).data)
                                    : "No se pudo generar el reporte."}
                            </Alert>
                        ) : null}
                    </div>
                </article>

                <DashboardFixedFooter>
                    <div className={GENERATE_REPORTS_FOOTER_ACTIONS}>
                        <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            className={GENERATE_REPORTS_FOOTER_BTN}
                            onClick={() => navigate("/dashboard")}
                            disabled={isLoading}
                        >
                            {GENERATE_REPORTS_CANCEL}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            className={cn(GENERATE_REPORTS_FOOTER_BTN, GENERATE_REPORTS_SUBMIT_CTA)}
                            disabled={isLoading}
                        >
                            {isLoading ? "Generando…" : GENERATE_REPORTS_SUBMIT}
                        </Button>
                    </div>
                </DashboardFixedFooter>
            </form>

            {reportResult ? (
                <article className={cn(GENERATE_REPORTS_FORM_CARD, "mt-6")}>
                    <NexiaGlassAccentRim />
                    <div className={GENERATE_REPORTS_FORM_BODY}>
                        <div className={GENERATE_REPORTS_FORM_DIVIDER} aria-hidden />
                        <section className={GENERATE_REPORTS_SECTION} aria-label={GENERATE_REPORTS_SECTION_RESULT}>
                            <h2 className={GENERATE_REPORTS_SECTION_TITLE}>
                                {GENERATE_REPORTS_SECTION_RESULT}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                ID:{" "}
                                <span className="font-medium text-foreground">{reportResult.report_id}</span>
                            </p>
                            {reportResult.data ? (
                                <div className="max-h-96 overflow-auto rounded-md border border-primary/20 bg-surface-2/40 p-4">
                                    <pre className="whitespace-pre-wrap text-xs text-foreground">
                                        {JSON.stringify(reportResult.data, null, 2)}
                                    </pre>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </article>
            ) : null}
        </div>
    );
};
