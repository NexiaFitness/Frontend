/**
 * TrainerFeedbackResponseForm.tsx — Respuesta entrenador a feedback atleta (F3a).
 */

import React, { useState } from "react";
import { useUpdateFeedbackTrainerResponseMutation } from "@nexia/shared/api/trainingSessionsApi";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";

export interface TrainerFeedbackResponseFormProps {
    feedbackId: number;
    clientId: number;
    existingResponse?: string | null;
}

export const TrainerFeedbackResponseForm: React.FC<TrainerFeedbackResponseFormProps> = ({
    feedbackId,
    clientId,
    existingResponse,
}) => {
    const { showToast } = useToast();
    const [text, setText] = useState(existingResponse ?? "");
    const [updateResponse, { isLoading }] = useUpdateFeedbackTrainerResponseMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        try {
            await updateResponse({
                feedbackId,
                clientId,
                trainer_response: trimmed,
            }).unwrap();
            showToast(
                "success",
                existingResponse ? "Respuesta actualizada" : "Respuesta enviada al atleta"
            );
        } catch {
            showToast("error", "No se pudo enviar la respuesta");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2 border-t border-border pt-3">
            <label
                htmlFor={`trainer-response-${feedbackId}`}
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
                {existingResponse ? "Editar respuesta" : "Responder al atleta"}
            </label>
            <textarea
                id={`trainer-response-${feedbackId}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Escribe un mensaje breve para el atleta…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading || !text.trim()}
            >
                {isLoading ? "Enviando…" : existingResponse ? "Actualizar respuesta" : "Enviar respuesta"}
            </Button>
        </form>
    );
};
