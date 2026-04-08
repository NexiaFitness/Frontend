/**
 * ClientInjuriesTab.tsx — Tab de Lesiones del cliente
 *
 * Diseño limpio: lista cronológica con filtros, sin badges excesivos.
 * is_active=true → activa, is_active=false → resuelta.
 *
 * @author Nelson Valero
 * @since v5.7.0
 * @updated v7.2.0 — Diseño minimalista, sin badges innecesarios
 */

import React, { useCallback, useMemo, useState } from "react";
import { Activity, Pencil, CheckCircle2, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useToast } from "@/components/ui/feedback";
import { PageTitle } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { EmptyStateCard } from "@/components/ui/cards";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { getMutationErrorMessage } from "@nexia/shared";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import {
    useUpdateInjuryMutation,
    useDeleteInjuryMutation,
} from "@nexia/shared/api/injuriesApi";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { InjuryFormModal } from "./InjuryFormModal";

interface ClientInjuriesTabProps {
    clientId: number;
}

type FilterValue = "all" | "active" | "resolved";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "active", label: "Activas" },
    { value: "resolved", label: "Resueltas" },
];

function label(injury: InjuryWithDetails, field: "joint" | "movement" | "muscle"): string | undefined {
    switch (field) {
        case "joint":
            return injury.joint_name_es || injury.joint_name;
        case "movement":
            return injury.movement_name_es || injury.movement_name;
        case "muscle":
            return injury.muscle_name_es || injury.muscle_name;
    }
}

function cap(s: string): string {
    return s.split(" ").map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");
}

function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function painColor(level: number): string {
    if (level <= 2) return "text-success";
    if (level === 3) return "text-warning";
    return "text-destructive";
}

export const ClientInjuriesTab: React.FC<ClientInjuriesTabProps> = ({ clientId }) => {
    const { showError, showSuccess } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInjury, setSelectedInjury] = useState<InjuryWithDetails | null>(null);
    const [filter, setFilter] = useState<FilterValue>("all");
    const [resolveId, setResolveId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { injuries, isLoading, activeCount, totalCount } = useClientInjuries({ clientId });

    const [updateInjury, { isLoading: isResolving }] = useUpdateInjuryMutation();
    const [deleteInjury, { isLoading: isDeleting }] = useDeleteInjuryMutation();

    const filteredInjuries = useMemo(() => {
        if (filter === "all") return injuries;
        return injuries.filter((i) => (filter === "active" ? i.is_active : !i.is_active));
    }, [filter, injuries]);

    const sortedInjuries = useMemo(
        () =>
            filteredInjuries
                .slice()
                .sort((a, b) => {
                    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
                    return (
                        new Date(b.start_date ?? b.created_at).getTime() -
                        new Date(a.start_date ?? a.created_at).getTime()
                    );
                }),
        [filteredInjuries],
    );

    const handleFilterChange = useCallback((next: FilterValue) => setFilter(next), []);

    const openNew = () => { setSelectedInjury(null); setIsModalOpen(true); };
    const openEdit = (injury: InjuryWithDetails) => { setSelectedInjury(injury); setIsModalOpen(true); };

    const resolveInjury = injuries.find((i) => i.id === resolveId);
    const deleteInjury_ = injuries.find((i) => i.id === deleteId);

    const handleResolve = async () => {
        if (!resolveId) return;
        const name = resolveInjury ? cap(label(resolveInjury, "joint") ?? "lesión") : "lesión";
        try {
            await updateInjury({ injuryId: resolveId, data: { is_active: false } }).unwrap();
            showSuccess(`Lesión «${name}» marcada como resuelta.`);
            setResolveId(null);
        } catch (err) { showError(getMutationErrorMessage(err)); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const name = deleteInjury_ ? cap(label(deleteInjury_, "joint") ?? "lesión") : "lesión";
        try {
            await deleteInjury(deleteId).unwrap();
            showSuccess(`Lesión «${name}» eliminada permanentemente.`);
            setDeleteId(null);
        } catch (err) { showError(getMutationErrorMessage(err)); }
    };

    const isEmpty = totalCount === 0;

    return (
        <section className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle
                    titleAs="h2"
                    title="Lesiones del cliente"
                    subtitle={
                        isEmpty
                            ? "Registro y seguimiento de lesiones."
                            : `${totalCount} registro${totalCount !== 1 ? "s" : ""}${activeCount > 0 ? ` · ${activeCount} activa${activeCount !== 1 ? "s" : ""}` : ""}`
                    }
                />
                {!isEmpty && (
                    <Button type="button" variant="primary" size="sm" onClick={openNew}>
                        Registrar lesión
                    </Button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : isEmpty ? (
                <EmptyStateCard
                    icon={<Activity className="h-8 w-8" aria-hidden />}
                    title="Sin lesiones registradas"
                    description="Registra una lesión para hacer seguimiento, coherencia del plan y alternativas de ejercicio."
                    action={
                        <Button type="button" variant="primary" size="sm" onClick={openNew}>
                            Registrar lesión
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {FILTER_OPTIONS.map(({ value, label: lbl }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleFilterChange(value)}
                                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                    filter === value
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                                }`}
                            >
                                {lbl}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    {sortedInjuries.length === 0 ? (
                        <EmptyStateCard
                            title="Nada que coincida con el filtro"
                            description="Prueba otro filtro o selecciona «Todas» para ver todo el historial."
                        />
                    ) : (
                        <ul className="space-y-2">
                            {sortedInjuries.map((injury) => {
                                const joint = label(injury, "joint");
                                const mov = label(injury, "movement");
                                const muscle = label(injury, "muscle");
                                const isActive = injury.is_active;
                                const dateStr = injury.start_date ?? injury.created_at;

                                return (
                                    <li key={injury.id}>
                                        <div className="rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30">
                                            {/* Info row */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {joint ? cap(joint) : "N/D"}
                                                        </span>
                                                        {mov && (
                                                            <span className="text-xs text-muted-foreground">
                                                                · {cap(mov)}
                                                            </span>
                                                        )}
                                                        {muscle && (
                                                            <span className="text-xs text-muted-foreground/60">
                                                                · {cap(muscle)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                                        <span className={isActive ? "text-warning font-medium" : "text-success"}>
                                                            {isActive ? "Activa" : "Resuelta"}
                                                        </span>
                                                        <span>
                                                            Dolor <span className={`font-semibold ${painColor(injury.pain_level)}`}>{injury.pain_level}/5</span>
                                                        </span>
                                                        {dateStr && <span>{fmtDate(dateStr)}</span>}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex shrink-0 items-center gap-0.5">
                                                    {isActive && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEdit(injury)}
                                                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                                                                aria-label="Editar"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setResolveId(injury.id)}
                                                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-success"
                                                                aria-label="Resolver"
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteId(injury.id)}
                                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                                                        aria-label="Eliminar"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {injury.notes && (
                                                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground/70">
                                                    {injury.notes}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* Form modal */}
            <InjuryFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedInjury(null); }}
                clientId={clientId}
                injury={selectedInjury}
            />

            {/* Resolve confirmation */}
            {resolveId != null && resolveInjury && (
                <BaseModal
                    isOpen
                    onClose={() => setResolveId(null)}
                    title="¿Resolver esta lesión?"
                    description="La lesión dejará de aparecer como activa."
                    iconType="success"
                >
                    <div className="space-y-4">
                        <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                                {cap(label(resolveInjury, "joint") ?? "N/D")}
                                {label(resolveInjury, "movement") && (
                                    <span className="font-normal text-muted-foreground"> · {cap(label(resolveInjury, "movement")!)}</span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Dolor {resolveInjury.pain_level}/5
                                {resolveInjury.start_date && ` · Desde ${fmtDate(resolveInjury.start_date)}`}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Puedes revertir este cambio editando el registro más adelante.
                        </p>
                        <div className="flex flex-col justify-end gap-2 sm:flex-row">
                            <Button type="button" variant="outline-destructive" size="sm" onClick={() => setResolveId(null)} disabled={isResolving} className="sm:min-w-[100px]">
                                Cancelar
                            </Button>
                            <Button type="button" variant="primary" size="sm" onClick={handleResolve} disabled={isResolving} isLoading={isResolving} className="sm:min-w-[100px]">
                                Marcar como resuelta
                            </Button>
                        </div>
                    </div>
                </BaseModal>
            )}

            {/* Delete confirmation */}
            {deleteId != null && deleteInjury_ && (
                <BaseModal
                    isOpen
                    onClose={() => setDeleteId(null)}
                    title="¿Eliminar esta lesión?"
                    description="Esta acción es permanente y no se puede deshacer."
                    iconType="danger"
                >
                    <div className="space-y-4">
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                                {cap(label(deleteInjury_, "joint") ?? "N/D")}
                                {label(deleteInjury_, "movement") && (
                                    <span className="font-normal text-muted-foreground"> · {cap(label(deleteInjury_, "movement")!)}</span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Dolor {deleteInjury_.pain_level}/5
                                {deleteInjury_.start_date && ` · Desde ${fmtDate(deleteInjury_.start_date)}`}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Se eliminará permanentemente del historial del cliente. El plan de entrenamiento dejará de considerar esta lesión.
                        </p>
                        <div className="flex flex-col justify-end gap-2 sm:flex-row">
                            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={isDeleting} className="sm:min-w-[100px]">
                                Cancelar
                            </Button>
                            <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting} isLoading={isDeleting} className="sm:min-w-[100px]">
                                Eliminar lesión
                            </Button>
                        </div>
                    </div>
                </BaseModal>
            )}
        </section>
    );
};
