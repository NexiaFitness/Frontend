/**
 * G3 — Edición mínima de sesión suelta (metadatos + cancelar + eliminar).
 * Ejercicios: detalle/consulta; ampliación fuera de Fase 1 mínimo.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormCombobox, Textarea } from "@/components/ui/forms";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useGetStandaloneSessionQuery,
    useUpdateStandaloneSessionMutation,
    useDeleteStandaloneSessionMutation,
} from "@nexia/shared/api/standaloneSessionsApi";
import { navigateDashboardBack, readSafeReturnTo } from "@/lib/sessionDetailNavigation";
import { SESSION_TYPES } from "@/pages/sessionProgramming/sessionFormConstants";

const DEFAULT_BACK = "/dashboard/sessions";

export const EditStandaloneSession: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const backTarget = readSafeReturnTo(location.state) ?? null;
    const goBack = useCallback(() => {
        navigateDashboardBack(navigate, location.state, DEFAULT_BACK);
    }, [navigate, location.state]);

    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id ?? 0;

    const { data: session, isLoading, isError } = useGetStandaloneSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });

    const [updateSession, { isLoading: isSaving }] = useUpdateStandaloneSessionMutation();
    const [deleteSession, { isLoading: isDeleting }] = useDeleteStandaloneSessionMutation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [sessionName, setSessionName] = useState("");
    const [sessionType, setSessionType] = useState("strength");
    const [plannedDuration, setPlannedDuration] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!session) return;
        setSessionName(session.session_name ?? "");
        setSessionType(session.session_type ?? "strength");
        setPlannedDuration(
            session.planned_duration != null ? String(session.planned_duration) : "",
        );
        setNotes(session.notes ?? "");
    }, [session]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        try {
            await updateSession({
                sessionId: session.id,
                body: {
                    session_name: sessionName.trim() || session.session_name,
                    session_type: sessionType,
                    planned_duration: plannedDuration ? Number(plannedDuration) : null,
                    notes: notes.trim() || null,
                },
            }).unwrap();
            showSuccess("Sesión actualizada.");
            navigate(`/dashboard/standalone-sessions/${session.id}`, {
                state: location.state,
            });
        } catch {
            showError("No se pudo guardar la sesión.");
        }
    };

    const handleCancelSession = async () => {
        if (!session || session.status === "cancelled") return;
        try {
            await updateSession({
                sessionId: session.id,
                body: { status: "cancelled" },
            }).unwrap();
            showSuccess("Sesión cancelada.");
            navigate(`/dashboard/standalone-sessions/${session.id}`, { state: location.state });
        } catch {
            showError("No se pudo cancelar la sesión.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!session || !trainerId) return;
        try {
            await deleteSession({
                sessionId: session.id,
                clientId: session.client_id,
                trainerId,
            }).unwrap();
            setShowDeleteModal(false);
            showSuccess("Sesión eliminada.");
            goBack();
        } catch {
            showError("No se pudo eliminar la sesión.");
        }
    };

    if (!sessionId || Number.isNaN(sessionId)) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de sesión inválido</Alert>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !session) {
        return (
            <div className="p-6 space-y-4">
                <Alert variant="error">No se pudo cargar la sesión.</Alert>
                <Button variant="outline" onClick={goBack}>
                    Volver
                </Button>
            </div>
        );
    }

    const isCancelled = session.status === "cancelled" || session.status === "skipped";
    const isCompleted = session.status === "completed";

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={goBack}>
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    {backTarget ? "Volver" : "Sesiones"}
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-bold">Editar sesión suelta</h1>
                <p className="text-sm text-muted-foreground">
                    Fecha: {session.session_date} · No editable en standalone (contrato BE)
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div>
                    <label className="text-sm font-medium">Nombre</label>
                    <Input
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        className="mt-1"
                        disabled={isCancelled}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <FormCombobox
                        value={sessionType}
                        onChange={setSessionType}
                        options={SESSION_TYPES}
                        placeholder="Tipo"
                        ariaLabel="Tipo de sesión"
                        disabled={isCancelled}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Duración (min)</label>
                    <Input
                        type="number"
                        value={plannedDuration}
                        onChange={(e) => setPlannedDuration(e.target.value)}
                        className="mt-1 max-w-[8rem]"
                        disabled={isCancelled}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Notas</label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                        rows={3}
                        disabled={isCancelled}
                    />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" variant="primary" disabled={isSaving || isCancelled}>
                        Guardar
                    </Button>
                    {!isCancelled && !isCompleted ? (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSaving}
                            onClick={handleCancelSession}
                        >
                            Cancelar sesión
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Eliminar
                    </Button>
                </div>
            </form>

            <NexiaPremiumConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!isDeleting) setShowDeleteModal(false);
                }}
                onConfirm={handleConfirmDelete}
                title="Eliminar sesión suelta"
                description="Esta acción no se puede deshacer. Se eliminará la sesión y sus ejercicios asociados."
                confirmLabel="Eliminar"
                isLoading={isDeleting}
                loadingConfirmLabel="Eliminando…"
                closeOnBackdrop={!isDeleting}
                closeOnEsc={!isDeleting}
            />
        </div>
    );
};
