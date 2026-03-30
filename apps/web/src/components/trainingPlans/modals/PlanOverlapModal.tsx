/**
 * PlanOverlapModal.tsx — Modal de confirmación por solapamiento de fechas
 *
 * Contexto:
 * - Aparece al intentar crear un plan cuyas fechas se solapan con uno existente
 * - Muestra el plan afectado y pregunta si continuar (archiva el anterior)
 *
 * Diseño:
 * - Basado en el patrón canónico de SelectClientModal (tema oscuro, bordes redondeados)
 *
 * @author Frontend Team
 * @since v7.1.0
 */

import React, { useEffect, useRef } from "react";
import { X, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

export interface PlanOverlapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    planName: string;
    planStartDate: string;
    planEndDate: string;
    isLoading?: boolean;
}

export const PlanOverlapModal: React.FC<PlanOverlapModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    planName,
    planStartDate,
    planEndDate,
    isLoading = false,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";

            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, isLoading, onClose]);

    const handleBackdropClick = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full max-w-lg transform transition-all",
                    "bg-surface border border-border rounded-lg shadow-lg",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                    "sm:max-w-md"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="plan-overlap-title"
                aria-describedby="plan-overlap-description"
                tabIndex={-1}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    aria-label="Cerrar"
                >
                    <X className="h-4 w-4 text-muted-foreground" aria-hidden />
                </button>

                {/* Header */}
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                    <h2
                        id="plan-overlap-title"
                        className="text-lg font-semibold leading-none tracking-tight text-foreground"
                    >
                        Solapamiento de fechas
                    </h2>
                </div>

                {/* Body */}
                <div className="space-y-3 p-6 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Las fechas del nuevo plan se solapan con el plan existente:
                    </p>

                    {/* Plan info block */}
                    <div className="space-y-1.5 rounded-lg bg-surface-2 p-3">
                        <div className="flex items-center gap-2">
                            <TriangleAlert
                                className="h-4 w-4 shrink-0 text-warning"
                                aria-hidden
                            />
                            <p className="text-sm font-medium">{planName}</p>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {planStartDate} — {planEndDate}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Se cerrará el plan anterior y se archivará. ¿Desea continuar?
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Continuar
                    </Button>
                </div>
            </div>
        </div>
    );
};
