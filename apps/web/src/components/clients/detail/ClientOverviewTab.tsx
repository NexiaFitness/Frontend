/**
 * ClientOverviewTab.tsx — Tab Overview del cliente
 *
 * Contexto:
 * - Muestra información general del cliente
 * - Secciones: Datos personales, Objetivos, Experiencia, Métricas antropométricas, Notes
 * - Basado en Figma Profile Page V1 y V2
 *
 * Responsabilidades:
 * - Mostrar todos los datos del cliente en formato legible
 * - Cards organizadas por categorías
 * - Notes en formato separado
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import React from "react";
import type { Client } from "@nexia/shared/types/client";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientOverviewTabProps {
    client: Client;
}

export const ClientOverviewTab: React.FC<ClientOverviewTabProps> = ({ client }) => {
    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                    Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Nombre completo" value={`${client.nombre} ${client.apellidos}`} />
                    <InfoRow label="Email" value={client.mail} />
                    <InfoRow label="Teléfono" value={client.telefono} />
                    <InfoRow label="Sexo" value={client.sexo} />
                    <InfoRow label="Fecha de alta" value={client.fecha_alta} />
                    <InfoRow label="ID/Passport" value={client.id_passport} />
                </div>
            </div>

            {/* Physical Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                    Métricas Físicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard label="Edad" value={client.edad} unit="años" />
                    <MetricCard label="Peso" value={client.peso} unit="kg" />
                    <MetricCard label="Altura" value={client.altura} unit="cm" />
                    <MetricCard label="IMC" value={client.imc?.toFixed(1)} />
                </div>
            </div>

            {/* Training Goals & Experience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Objetivos */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                        Objetivos de Entrenamiento
                    </h3>
                    <div className="space-y-3">
                        <InfoRow label="Objetivo principal" value={client.objetivo_entrenamiento} />
                        <InfoRow label="Fecha definición" value={client.fecha_definicion_objetivo} />
                        <InfoRow label="Descripción" value={client.descripcion_objetivos} />
                    </div>
                </div>

                {/* Experiencia */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                        Experiencia y Frecuencia
                    </h3>
                    <div className="space-y-3">
                        <InfoRow label="Nivel de experiencia" value={client.experiencia} />
                        <InfoRow label="Frecuencia semanal" value={client.frecuencia_semanal} />
                        <InfoRow label="Duración sesión" value={client.session_duration} />
                    </div>
                </div>
            </div>

            {/* Anthropometric Metrics (si existen) */}
            {hasAnthropometricData(client) && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                        Métricas Antropométricas
                    </h3>

                    {/* Skinfolds */}
                    {hasSkinfolds(client) && (
                        <div className="mb-6">
                            <h4 className={`${TYPOGRAPHY.cardTitle} text-gray-800 mb-3`}>
                                Pliegues Cutáneos (mm)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <AnthroMetric label="Tríceps" value={client.skinfold_triceps} />
                                <AnthroMetric label="Subescapular" value={client.skinfold_subscapular} />
                                <AnthroMetric label="Bíceps" value={client.skinfold_biceps} />
                                <AnthroMetric label="Cresta ilíaca" value={client.skinfold_iliac_crest} />
                                <AnthroMetric label="Supraespinal" value={client.skinfold_supraspinal} />
                                <AnthroMetric label="Abdominal" value={client.skinfold_abdominal} />
                                <AnthroMetric label="Muslo" value={client.skinfold_thigh} />
                                <AnthroMetric label="Pantorrilla" value={client.skinfold_calf} />
                            </div>
                        </div>
                    )}

                    {/* Girths */}
                    {hasGirths(client) && (
                        <div className="mb-6">
                            <h4 className={`${TYPOGRAPHY.cardTitle} text-gray-800 mb-3`}>
                                Perímetros (cm)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <AnthroMetric label="Brazo relajado" value={client.girth_relaxed_arm} />
                                <AnthroMetric label="Brazo contraído" value={client.girth_flexed_contracted_arm} />
                                <AnthroMetric label="Cintura" value={client.girth_waist_minimum} />
                                <AnthroMetric label="Cadera" value={client.girth_hips_maximum} />
                                <AnthroMetric label="Muslo" value={client.girth_medial_thigh} />
                                <AnthroMetric label="Pantorrilla" value={client.girth_maximum_calf} />
                            </div>
                        </div>
                    )}

                    {/* Diameters */}
                    {hasDiameters(client) && (
                        <div>
                            <h4 className={`${TYPOGRAPHY.cardTitle} text-gray-800 mb-3`}>
                                Diámetros Óseos (cm)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <AnthroMetric label="Húmero" value={client.diameter_humerus_biepicondylar} />
                                <AnthroMetric label="Fémur" value={client.diameter_femur_bicondylar} />
                                <AnthroMetric label="Muñeca" value={client.diameter_bi_styloid_wrist} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Health & Observations */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                    Salud y Observaciones
                </h3>
                <div className="space-y-3">
                    <InfoRow label="Lesiones relevantes" value={client.lesiones_relevantes} isTextArea />
                    <InfoRow label="Observaciones" value={client.observaciones} isTextArea />
                </div>
            </div>

            {/* Notes */}
            {(client.notes_1 || client.notes_2 || client.notes_3) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {client.notes_1 && <NoteCard title="Note #1" content={client.notes_1} />}
                    {client.notes_2 && <NoteCard title="Note #2" content={client.notes_2} />}
                    {client.notes_3 && <NoteCard title="Note #3" content={client.notes_3} />}
                </div>
            )}
        </div>
    );
};

// ========================================
// HELPER COMPONENTS
// ========================================

interface InfoRowProps {
    label: string;
    value?: string | number | null;
    isTextArea?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isTextArea = false }) => {
    if (!value) return null;

    return (
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className={`mt-1 text-sm text-gray-900 ${isTextArea ? "whitespace-pre-wrap" : ""}`}>
                {value}
            </dd>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value?: number | string | null;
    unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit }) => {
    if (value === null || value === undefined) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`${TYPOGRAPHY.metric} text-gray-900`}>
                {value}
                {unit && <span className="text-base ml-1 text-gray-600">{unit}</span>}
            </p>
        </div>
    );
};

interface AnthroMetricProps {
    label: string;
    value?: number | null;
}

const AnthroMetric: React.FC<AnthroMetricProps> = ({ label, value }) => {
    if (value === null || value === undefined) return null;

    return (
        <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
        </div>
    );
};

interface NoteCardProps {
    title: string;
    content: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ title, content }) => {
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">{title}</h4>
            <p className="text-sm text-yellow-800 whitespace-pre-wrap">{content}</p>
        </div>
    );
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function hasAnthropometricData(client: Client): boolean {
    return hasSkinfolds(client) || hasGirths(client) || hasDiameters(client);
}

function hasSkinfolds(client: Client): boolean {
    return !!(
        client.skinfold_triceps ||
        client.skinfold_subscapular ||
        client.skinfold_biceps ||
        client.skinfold_iliac_crest ||
        client.skinfold_supraspinal ||
        client.skinfold_abdominal ||
        client.skinfold_thigh ||
        client.skinfold_calf
    );
}

function hasGirths(client: Client): boolean {
    return !!(
        client.girth_relaxed_arm ||
        client.girth_flexed_contracted_arm ||
        client.girth_waist_minimum ||
        client.girth_hips_maximum ||
        client.girth_medial_thigh ||
        client.girth_maximum_calf
    );
}

function hasDiameters(client: Client): boolean {
    return !!(
        client.diameter_humerus_biepicondylar ||
        client.diameter_femur_bicondylar ||
        client.diameter_bi_styloid_wrist
    );
}