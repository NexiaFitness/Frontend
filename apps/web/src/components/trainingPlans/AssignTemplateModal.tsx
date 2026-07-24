/**
 * AssignTemplateModal.tsx — Modal para asignar plantilla a cliente
 *
 * PR6: end_date solo desde assign-preview (BE autoridad). Sin cálculo en TS.
 */

import React, { useState, useEffect, useMemo } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import { useAssignTemplate } from "@nexia/shared/hooks/training/useAssignTemplate";
import { usePreviewTemplateProgramAssignMutation } from "@nexia/shared/api/templateProgramApi";
import { useGetTrainerClientsQuery, useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { TemplateAssignPreviewOut } from "@nexia/shared/types/templateProgram";
import type { SelectOption } from "@/components/ui/forms";

interface AssignTemplateModalProps {
    open: boolean;
    onClose: () => void;
    templateId: number | null;
    templateName?: string;
    onSuccess?: () => void;
    clientId?: number;
    clientName?: string;
}

export const AssignTemplateModal: React.FC<AssignTemplateModalProps> = ({
    open,
    onClose,
    templateId,
    templateName,
    onSuccess,
    clientId: fixedClientId,
    clientName: fixedClientName,
}) => {
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id;

    const { data: clientData } = useGetClientQuery(fixedClientId ?? 0, {
        skip: !fixedClientId || !open,
    });
    const resolvedClientName =
        fixedClientName ??
        (clientData ? `${clientData.nombre} ${clientData.apellidos}` : null);

    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        {
            skip: !trainerId || !open || !!fixedClientId,
        },
    );

    const clients = clientsData?.items ?? [];
    const { assignTemplate, isAssigning, isError, error } = useAssignTemplate();
    const [previewAssign, { isLoading: isPreviewLoading }] =
        usePreviewTemplateProgramAssignMutation();

    const [formData, setFormData] = useState({
        client_id: "",
        start_date: "",
        name: templateName || "",
    });
    const [preview, setPreview] = useState<TemplateAssignPreviewOut | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resolvedClientId = useMemo(() => {
        if (fixedClientId != null) return fixedClientId;
        const parsed = Number(formData.client_id);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [fixedClientId, formData.client_id]);

    useEffect(() => {
        if (open) {
            setFormData({
                client_id: fixedClientId != null ? String(fixedClientId) : "",
                start_date: "",
                name: templateName || "",
            });
            setPreview(null);
            setPreviewError(null);
            setErrors({});
        }
    }, [open, templateName, fixedClientId]);

    useEffect(() => {
        if (!open || !templateId || !resolvedClientId || !formData.start_date) {
            setPreview(null);
            setPreviewError(null);
            return;
        }

        let cancelled = false;
        const load = async () => {
            try {
                const result = await previewAssign({
                    templateId,
                    data: {
                        client_id: resolvedClientId,
                        start_date: formData.start_date,
                    },
                }).unwrap();
                if (!cancelled) {
                    setPreview(result);
                    setPreviewError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setPreview(null);
                    setPreviewError(
                        err && typeof err === "object" && "data" in err
                            ? String((err as { data: unknown }).data ?? "Error en preview")
                            : "No se pudo calcular la duración del programa",
                    );
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [open, templateId, resolvedClientId, formData.start_date, previewAssign]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!resolvedClientId) {
            newErrors.client_id = "Debes seleccionar un cliente";
        }
        if (!formData.start_date) {
            newErrors.start_date = "La fecha de inicio es obligatoria";
        }
        if (!preview?.end_date) {
            newErrors.start_date =
                newErrors.start_date ?? "Espera el cálculo de fin desde el servidor";
        }
        if (preview && !preview.assignable) {
            newErrors.assign = preview.block_reasons[0] ?? "La plantilla no es asignable";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !templateId || !preview?.end_date || !resolvedClientId) {
            return;
        }

        try {
            await assignTemplate({
                template_id: templateId,
                client_id: resolvedClientId,
                start_date: formData.start_date,
                name: formData.name || undefined,
            });

            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        } catch (err) {
            console.error("Error assigning template:", err);
        }
    };

    const clientOptions: SelectOption[] = clients.map((client) => ({
        value: client.id.toString(),
        label: `${client.nombre} ${client.apellidos}`,
    }));

    const today = new Date().toISOString().split("T")[0];

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Asignar plantilla a cliente"
            description={
                templateName
                    ? `Asignar "${templateName}" a un cliente`
                    : "Selecciona cliente e inicio; el fin lo calcula el servidor"
            }
            closeOnBackdrop={!isAssigning}
            closeOnEsc={!isAssigning}
            isLoading={isAssigning}
        >
            <div className="space-y-4">
                {isError ? (
                    <Alert variant="error">
                        {error &&
                        typeof error === "object" &&
                        "data" in error &&
                        typeof error.data === "object" &&
                        error.data &&
                        "detail" in error.data
                            ? String(error.data.detail)
                            : "Error al asignar la plantilla. Intenta de nuevo."}
                    </Alert>
                ) : null}

                {previewError ? <Alert variant="error">{previewError}</Alert> : null}

                {preview && !preview.assignable ? (
                    <Alert variant="warning">
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                            {preview.block_reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}

                {preview?.warnings?.length ? (
                    <Alert variant="warning">
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                            {preview.warnings.map((w) => (
                                <li key={w.code}>{w.message}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}

                {clients.length === 0 && fixedClientId == null ? (
                    <Alert variant="warning">
                        No tienes clientes disponibles. Crea un cliente primero.
                    </Alert>
                ) : null}

                <div className="space-y-4">
                    {fixedClientId != null ? (
                        <div>
                            <span className="mb-1.5 block text-sm font-medium text-foreground">
                                Cliente
                            </span>
                            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                                Asignando a: {resolvedClientName ?? `Cliente #${fixedClientId}`}
                            </p>
                        </div>
                    ) : (
                        <FormSelect
                            label="Cliente"
                            isRequired
                            options={clientOptions}
                            placeholder="Selecciona un cliente"
                            value={formData.client_id}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, client_id: e.target.value }));
                                if (errors.client_id) {
                                    setErrors((prev) => ({ ...prev, client_id: "" }));
                                }
                            }}
                            error={errors.client_id}
                            disabled={clients.length === 0 || isAssigning}
                        />
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Nombre personalizado (opcional)
                        </label>
                        <Input
                            type="text"
                            placeholder={templateName || "Nombre del plan para este cliente"}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            disabled={isAssigning}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Fecha de inicio <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, start_date: e.target.value }));
                                if (errors.start_date) {
                                    setErrors((prev) => ({ ...prev, start_date: "" }));
                                }
                            }}
                            error={errors.start_date}
                            min={today}
                            disabled={isAssigning}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Fecha de fin (calculada)
                        </label>
                        <Input
                            type="date"
                            value={preview?.end_date ?? ""}
                            readOnly
                            disabled
                            placeholder={isPreviewLoading ? "Calculando…" : "Selecciona inicio"}
                        />
                        {preview?.program_week_count ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {preview.program_week_count} semanas · origen:{" "}
                                {preview.duration_source === "structure"
                                    ? "estructura del programa"
                                    : "metadata declarada"}
                            </p>
                        ) : null}
                    </div>

                    {errors.assign ? (
                        <p className="text-sm text-destructive">{errors.assign}</p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isAssigning}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isAssigning || isPreviewLoading}
                        disabled={
                            (fixedClientId == null && clients.length === 0) ||
                            isAssigning ||
                            isPreviewLoading ||
                            !preview?.assignable
                        }
                        className="flex-1 sm:flex-none"
                    >
                        {isAssigning ? "Asignando…" : "Asignar plantilla"}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
