/**
 * SaveAsTemplateModal.tsx — Nombre obligatorio al guardar plantilla de sesión (B15)
 */

import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";

export interface SaveAsTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (payload: { templateName: string; description: string }) => void;
    isLoading?: boolean;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTemplateName("");
        setDescription("");
        setNameError(null);
    }, [isOpen]);

    const handleSubmit = () => {
        const trimmed = templateName.trim();
        if (trimmed.length < 3) {
            setNameError("El nombre debe tener al menos 3 caracteres");
            return;
        }
        setNameError(null);
        onConfirm({ templateName: trimmed, description: description.trim() });
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Guardar como plantilla"
            description="Las plantillas viven en tu biblioteca. Elige un nombre que te permita encontrarla después."
            iconType="info"
            maxWidth="md"
            closeOnBackdrop={!isLoading}
            closeOnEsc={!isLoading}
            isLoading={isLoading}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Nombre de la plantilla *
                    </label>
                    <Input
                        type="text"
                        value={templateName}
                        onChange={(e) => {
                            setTemplateName(e.target.value);
                            if (nameError) setNameError(null);
                        }}
                        placeholder="Ej: Pierna A — hipertrofia"
                        className="bg-surface"
                        autoFocus
                    />
                    {nameError ? (
                        <p className="text-destructive text-xs mt-1">{nameError}</p>
                    ) : null}
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Descripción (opcional)
                    </label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Notas para recordar cuándo usar esta plantilla"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        isLoading={isLoading}
                    >
                        <ClipboardList className="mr-1 h-4 w-4" aria-hidden />
                        Guardar plantilla
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
