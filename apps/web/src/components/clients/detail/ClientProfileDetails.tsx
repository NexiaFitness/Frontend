/**
 * ClientProfileDetails.tsx — Perfil completo en SidePanel (siempre visible, con «—» si falta dato).
 */

import React from "react";
import type { Client } from "@nexia/shared/types/client";
import { TRAINING_DAY_LABELS, type TrainingDayValue } from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientProfileDetailsProps {
    client: Client;
}

function display(value?: string | number | null): string {
    if (value == null || value === "") return "—";
    return String(value);
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-surface/80 p-3">
            <dt className={TYPOGRAPHY.labelSmall}>{label}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h4 className={`${TYPOGRAPHY.dashboardViewHeading} mb-3 text-foreground`}>{title}</h4>
            {children}
        </div>
    );
}

function formatJoinedDate(fechaAlta: string): string {
    return new Date(fechaAlta).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatSessionDuration(duration?: string | null): string {
    if (!duration) return "—";
    const map: Record<string, string> = {
        short_lt_1h: "Menos de 1h",
        medium_1h_to_1h30: "1h–1h30",
        long_gt_1h30: "Más de 1h30",
    };
    return map[duration] ?? duration;
}

function formatTrainingDays(days?: string[] | null): string {
    if (!days?.length) return "—";
    return days.map((d) => TRAINING_DAY_LABELS[d as TrainingDayValue] ?? d).join(", ");
}

function AnthroMetric({ label, value }: { label: string; value?: number | null }) {
    return (
        <div className="rounded-lg border border-border bg-surface p-3 text-center">
            <p className={TYPOGRAPHY.labelSmall}>{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{display(value)}</p>
        </div>
    );
}

function hasSkinfolds(client: Client): boolean {
    return Boolean(
        client.skinfold_triceps ||
            client.skinfold_subscapular ||
            client.skinfold_biceps ||
            client.skinfold_iliac_crest ||
            client.skinfold_supraspinal ||
            client.skinfold_abdominal ||
            client.skinfold_thigh ||
            client.skinfold_calf,
    );
}

function hasGirths(client: Client): boolean {
    return Boolean(
        client.girth_relaxed_arm ||
            client.girth_flexed_contracted_arm ||
            client.girth_waist_minimum ||
            client.girth_hips_maximum ||
            client.girth_medial_thigh ||
            client.girth_maximum_calf,
    );
}

function hasDiameters(client: Client): boolean {
    return Boolean(
        client.diameter_humerus_biepicondylar ||
            client.diameter_femur_bicondylar ||
            client.diameter_bi_styloid_wrist,
    );
}

export const ClientProfileDetails: React.FC<ClientProfileDetailsProps> = ({ client }) => {
    const notes = [client.notes_1, client.notes_2, client.notes_3, client.observaciones].filter(
        (n) => (n ?? "").trim(),
    );

    return (
        <div className="space-y-8">
            <Section title="Datos físicos">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <InfoTile label="Peso" value={client.peso != null ? `${client.peso} kg` : "—"} />
                    <InfoTile label="Altura" value={client.altura != null ? `${client.altura} cm` : "—"} />
                    <InfoTile label="IMC" value={client.imc != null ? client.imc.toFixed(1) : "—"} />
                    <InfoTile label="Edad" value={display(client.edad)} />
                </div>
            </Section>

            <Section title="Contacto">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoTile label="Email" value={display(client.mail)} />
                    <InfoTile label="Teléfono" value={display(client.telefono)} />
                    <InfoTile label="Sexo" value={display(client.sexo)} />
                    <InfoTile label="ID / Passport" value={display(client.id_passport)} />
                    <InfoTile label="Fecha de alta" value={formatJoinedDate(client.fecha_alta)} />
                    <InfoTile label="Nacimiento" value={display(client.birthdate)} />
                </div>
            </Section>

            <Section title="Entrenamiento">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoTile label="Objetivo" value={display(client.objetivo_entrenamiento)} />
                    <InfoTile label="Experiencia" value={display(client.experiencia)} />
                    <InfoTile
                        label="Duración sesiones"
                        value={formatSessionDuration(client.session_duration)}
                    />
                    <InfoTile label="Días de entreno" value={formatTrainingDays(client.training_days)} />
                    <InfoTile
                        label="Frecuencia semanal"
                        value={display(client.exact_training_frequency ?? client.frecuencia_semanal)}
                    />
                </div>
            </Section>

            <Section title="Objetivos">
                <div className="grid grid-cols-1 gap-3">
                    <InfoTile
                        label="Fecha definición"
                        value={display(client.fecha_definicion_objetivo)}
                    />
                    <InfoTile label="Descripción" value={display(client.descripcion_objetivos)} />
                </div>
            </Section>

            <Section title="Antecedentes">
                <InfoTile label="Lesiones relevantes" value={display(client.lesiones_relevantes)} />
            </Section>

            <Section title="Notas del entrenador">
                {notes.length > 0 ? (
                    <div className="space-y-3">
                        {notes.map((note, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border bg-surface/80 p-3 text-sm text-foreground whitespace-pre-wrap"
                            >
                                {note}
                            </div>
                        ))}
                    </div>
                ) : (
                    <InfoTile label="Observaciones" value="—" />
                )}
            </Section>

            {(hasSkinfolds(client) || hasGirths(client) || hasDiameters(client)) && (
                <Section title="Antropometría de perfil">
                    {hasSkinfolds(client) && (
                        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                            <AnthroMetric label="Tríceps" value={client.skinfold_triceps} />
                            <AnthroMetric label="Subescapular" value={client.skinfold_subscapular} />
                            <AnthroMetric label="Bíceps" value={client.skinfold_biceps} />
                            <AnthroMetric label="Cresta ilíaca" value={client.skinfold_iliac_crest} />
                            <AnthroMetric label="Supraespinal" value={client.skinfold_supraspinal} />
                            <AnthroMetric label="Abdominal" value={client.skinfold_abdominal} />
                            <AnthroMetric label="Muslo" value={client.skinfold_thigh} />
                            <AnthroMetric label="Pantorrilla" value={client.skinfold_calf} />
                        </div>
                    )}
                    {hasGirths(client) && (
                        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                            <AnthroMetric label="Brazo relajado" value={client.girth_relaxed_arm} />
                            <AnthroMetric
                                label="Brazo contraído"
                                value={client.girth_flexed_contracted_arm}
                            />
                            <AnthroMetric label="Cintura" value={client.girth_waist_minimum} />
                            <AnthroMetric label="Cadera" value={client.girth_hips_maximum} />
                            <AnthroMetric label="Muslo" value={client.girth_medial_thigh} />
                            <AnthroMetric label="Pantorrilla" value={client.girth_maximum_calf} />
                        </div>
                    )}
                    {hasDiameters(client) && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                            <AnthroMetric label="Húmero" value={client.diameter_humerus_biepicondylar} />
                            <AnthroMetric label="Fémur" value={client.diameter_femur_bicondylar} />
                            <AnthroMetric label="Muñeca" value={client.diameter_bi_styloid_wrist} />
                        </div>
                    )}
                </Section>
            )}
        </div>
    );
};
