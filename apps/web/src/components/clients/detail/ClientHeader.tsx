/**
 * ClientHeader.tsx — Header premium ficha cliente (UX-OVERVIEW v2).
 *
 * Tipografía NEXIA_PORTAL_* (paridad atleta); superficies trainer sin glass.
 */

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import type { Client } from "@nexia/shared/types/client";
import { TRAINING_DAY_LABELS, type TrainingDayValue } from "@nexia/shared";
import {
    labelClientExperience,
    labelSessionDuration,
    labelTrainingGoal,
} from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Textarea } from "@/components/ui/forms";
import { ClientAvatar } from "@/components/ui/avatar";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { ClientProfileSidePanel } from "./ClientProfileSidePanel";
import { ClientInboxBell } from "./ClientInboxBell";
import { cn } from "@/lib/utils";
import {
    CLIENT_HEADER_ACTION_BUTTON_MOBILE,
    CLIENT_HEADER_AVATAR_BUTTON,
    CLIENT_HEADER_DESKTOP_ACTIONS_WRAP,
    CLIENT_HEADER_HERO_OUTER,
    CLIENT_HEADER_IDENTITY_BLOCK,
    CLIENT_HEADER_META,
    CLIENT_HEADER_MOBILE_ACTIONS_WRAP,
    CLIENT_HEADER_NAME,
    CLIENT_HEADER_NAME_ROW,
    CLIENT_HEADER_TITLE_ROW,
    CLIENT_HEADER_NOTE_BODY,
    CLIENT_HEADER_OBS_QUICK_NOTE,
    CLIENT_HEADER_OBS_HEADER,
    CLIENT_HEADER_OBS_NOTE_ITEM,
    CLIENT_HEADER_OBS_NOTE_LABEL,
    CLIENT_HEADER_OBS_NOTE_LIST,
    CLIENT_HEADER_OBS_EMPTY,
    CLIENT_HEADER_OBS_SHELL,
    CLIENT_HEADER_OBS_TITLE,
    CLIENT_HEADER_PREF_CELL,
    CLIENT_HEADER_PREF_GRID,
    CLIENT_HEADER_PREF_LABEL,
    CLIENT_HEADER_PREF_VALUE,
    CLIENT_HEADER_QUICK_NOTE_TRIGGER,
    CLIENT_HEADER_SHELL,
    CLIENT_HEADER_SHOW_GENERATE_REPORT,
    NEXIA_PORTAL_GREETING_NAME,
} from "./clientHeaderPresentation";

interface ClientHeaderProps {
    client: Client;
    clientId?: number;
    onEditProfile?: () => void;
    breadcrumbItems?: BreadcrumbItem[];
    onPlanificar?: () => void;
    onSaveQuickNote?: (text: string) => Promise<boolean>;
    isSavingQuickNote?: boolean;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
    client,
    clientId: clientIdProp,
    onEditProfile,
    breadcrumbItems,
    onPlanificar,
    onSaveQuickNote,
    isSavingQuickNote = false,
}) => {
    const [quickNoteOpen, setQuickNoteOpen] = useState(false);
    const [quickNoteDraft, setQuickNoteDraft] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const clientId = clientIdProp ?? client.id;

    const calculateAge = (birthdate: string | undefined | null): number | null => {
        if (!birthdate) return null;
        try {
            const birth = new Date(birthdate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch {
            return null;
        }
    };

    const clientAge = client.edad ?? (client.birthdate ? calculateAge(client.birthdate) : null);

    const formatJoinedDate = (fechaAlta: string): string => {
        const date = new Date(fechaAlta);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTrainingDays = (days?: string[] | null): string => {
        if (!days || days.length === 0) return "—";
        return days
            .map((d) => TRAINING_DAY_LABELS[d as TrainingDayValue] ?? d)
            .join(", ");
    };

    const hasAnyNote = Boolean(
        (client.notes_1 ?? "").trim() ||
            (client.notes_2 ?? "").trim() ||
            (client.notes_3 ?? "").trim() ||
            (client.observaciones ?? "").trim(),
    );

    const handleSaveQuickNote = async () => {
        if (!onSaveQuickNote || !quickNoteDraft.trim()) return;
        const ok = await onSaveQuickNote(quickNoteDraft);
        if (ok) {
            setQuickNoteDraft("");
            setQuickNoteOpen(false);
        }
    };

    const metaLine = [
        clientAge != null && `${clientAge} años`,
        client.peso != null && `${client.peso} kg`,
        client.altura != null && `${client.altura} cm`,
        client.imc != null && `IMC ${client.imc.toFixed(1)}`,
        `Alta ${formatJoinedDate(client.fecha_alta)}`,
    ]
        .filter(Boolean)
        .join(" · ");

    const preferences = [
        { label: "Objetivo", value: labelTrainingGoal(client.objetivo_entrenamiento) },
        { label: "Nivel de experiencia", value: labelClientExperience(client.experiencia) },
        { label: "Duración sesiones", value: labelSessionDuration(client.session_duration) },
        { label: "Días de entreno", value: formatTrainingDays(client.training_days) },
    ];

    const headerActions = (
        <>
            <ClientInboxBell clientId={clientId} />
            {onPlanificar && (
                <Button
                    variant="primary"
                    size="sm"
                    className={CLIENT_HEADER_ACTION_BUTTON_MOBILE}
                    onClick={onPlanificar}
                    aria-label="Planificar"
                >
                    Planificar
                </Button>
            )}
            {CLIENT_HEADER_SHOW_GENERATE_REPORT && (
                <Button variant="outline" size="sm" disabled>
                    Generar Reporte
                </Button>
            )}
            {onEditProfile && (
                <Button
                    variant="ghost-primary"
                    size="sm"
                    className={CLIENT_HEADER_ACTION_BUTTON_MOBILE}
                    onClick={onEditProfile}
                >
                    <Pencil aria-hidden="true" />
                    <span className="sm:inline">Editar Perfil</span>
                </Button>
            )}
        </>
    );

    return (
        <div className={CLIENT_HEADER_SHELL} data-testid="client-header">
            {breadcrumbItems && breadcrumbItems.length > 0 && (
                <Breadcrumbs items={breadcrumbItems} className="mb-0.5" />
            )}

            <div className={CLIENT_HEADER_HERO_OUTER}>
                <div className={CLIENT_HEADER_NAME_ROW}>
                    <button
                        type="button"
                        onClick={() => setProfileOpen(true)}
                        className={CLIENT_HEADER_AVATAR_BUTTON}
                        aria-label="Ver perfil completo del cliente"
                    >
                        <ClientAvatar
                            clientId={client.id}
                            nombre={client.nombre}
                            apellidos={client.apellidos}
                            size="lg"
                        />
                    </button>

                    <div className={CLIENT_HEADER_IDENTITY_BLOCK}>
                        <div className={CLIENT_HEADER_TITLE_ROW}>
                            <h1 className={cn(CLIENT_HEADER_NAME, "min-w-0 flex-1 sm:flex-none")}>
                                <span className={NEXIA_PORTAL_GREETING_NAME}>{client.nombre}</span>
                                {client.apellidos ? ` ${client.apellidos}` : ""}
                            </h1>
                            <div className={CLIENT_HEADER_DESKTOP_ACTIONS_WRAP}>{headerActions}</div>
                        </div>
                    </div>
                </div>

                <p className={CLIENT_HEADER_META}>{metaLine}</p>

                <div className={CLIENT_HEADER_MOBILE_ACTIONS_WRAP}>{headerActions}</div>
            </div>

            <NexiaPremiumDivider className="w-full" />

            <div className={CLIENT_HEADER_PREF_GRID}>
                {preferences.map((pref) => (
                    <div key={pref.label} className={CLIENT_HEADER_PREF_CELL}>
                        <span className={CLIENT_HEADER_PREF_LABEL}>{pref.label}</span>
                        <p className={CLIENT_HEADER_PREF_VALUE}>{pref.value}</p>
                    </div>
                ))}
            </div>

            <div className={CLIENT_HEADER_OBS_SHELL}>
                <NexiaGlassAccentRim />
                <div className={CLIENT_HEADER_OBS_HEADER}>
                    <h2 className={CLIENT_HEADER_OBS_TITLE}>Observaciones</h2>
                    {onSaveQuickNote && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuickNoteOpen((o) => !o);
                                if (quickNoteOpen) setQuickNoteDraft("");
                            }}
                            className={CLIENT_HEADER_QUICK_NOTE_TRIGGER}
                        >
                            {quickNoteOpen ? "Cerrar" : "+ Añadir nota"}
                        </button>
                    )}
                </div>

                {onSaveQuickNote && quickNoteOpen && (
                    <div className={CLIENT_HEADER_OBS_QUICK_NOTE}>
                        <Textarea
                            value={quickNoteDraft}
                            onChange={(e) => setQuickNoteDraft(e.target.value)}
                            placeholder="Escribe la nota…"
                            rows={3}
                            className="text-foreground"
                            disabled={isSavingQuickNote}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                onClick={handleSaveQuickNote}
                                disabled={isSavingQuickNote || !quickNoteDraft.trim()}
                                isLoading={isSavingQuickNote}
                            >
                                Guardar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setQuickNoteOpen(false);
                                    setQuickNoteDraft("");
                                }}
                                disabled={isSavingQuickNote}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                <div className={CLIENT_HEADER_OBS_NOTE_LIST}>
                    {!hasAnyNote && (
                        <p className={CLIENT_HEADER_OBS_EMPTY}>Sin observaciones.</p>
                    )}
                    {client.notes_1?.trim() && (
                        <div className={CLIENT_HEADER_OBS_NOTE_ITEM}>
                            <span className={CLIENT_HEADER_OBS_NOTE_LABEL}>Nota 1</span>
                            <p className={CLIENT_HEADER_NOTE_BODY}>{client.notes_1}</p>
                        </div>
                    )}
                    {client.notes_2?.trim() && (
                        <div className={CLIENT_HEADER_OBS_NOTE_ITEM}>
                            <span className={CLIENT_HEADER_OBS_NOTE_LABEL}>Nota 2</span>
                            <p className={CLIENT_HEADER_NOTE_BODY}>{client.notes_2}</p>
                        </div>
                    )}
                    {client.notes_3?.trim() && (
                        <div className={CLIENT_HEADER_OBS_NOTE_ITEM}>
                            <span className={CLIENT_HEADER_OBS_NOTE_LABEL}>Nota 3</span>
                            <p className={CLIENT_HEADER_NOTE_BODY}>{client.notes_3}</p>
                        </div>
                    )}
                    {client.observaciones?.trim() && (
                        <div className={CLIENT_HEADER_OBS_NOTE_ITEM}>
                            <span className={CLIENT_HEADER_OBS_NOTE_LABEL}>Nota libre</span>
                            <p className={CLIENT_HEADER_NOTE_BODY}>{client.observaciones}</p>
                        </div>
                    )}
                </div>
            </div>

            <ClientProfileSidePanel
                client={client}
                isOpen={profileOpen}
                onClose={() => setProfileOpen(false)}
                onEditProfile={onEditProfile}
            />
        </div>
    );
};
