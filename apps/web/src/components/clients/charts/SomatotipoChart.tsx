/**
 * SomatotipoChart.tsx — Gráfico triangular de somatotipo
 *
 * Contexto:
 * - Visualiza el somatotipo del cliente en un triángulo
 * - Valores: Endomorph, Mesomorph, Ectomorph (1-7 cada uno)
 * - Calcula posición del punto en el triángulo basado en los valores
 * - Muestra descripción del somatotipo dominante
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React, { useMemo } from "react";

interface SomatotipoChartProps {
    endomorph: number | null | undefined;
    mesomorph: number | null | undefined;
    ectomorph: number | null | undefined;
}

interface SomatotypeDescription {
    dominant: string;
    description: string;
}

// Descripciones de somatotipos
const SOMATOTYPE_DESCRIPTIONS: Record<string, SomatotypeDescription> = {
    endomorph: {
        dominant: "Endomorfo Dominante",
        description: "Tendencia a acumular grasa corporal con estructura ósea más grande. Responde bien a entrenamiento de resistencia y control calórico.",
    },
    mesomorph: {
        dominant: "Mesomorfo Dominante",
        description: "Estructura naturalmente muscular con músculos bien definidos y físico atlético. Responde bien al entrenamiento de resistencia y tiende a desarrollar músculo eficientemente.",
    },
    ectomorph: {
        dominant: "Ectomorfo Dominante",
        description: "Estructura delgada con poca grasa corporal y músculo. Responde bien a entrenamiento de fuerza con enfoque en volumen y nutrición.",
    },
};

export const SomatotipoChart: React.FC<SomatotipoChartProps> = ({
    endomorph,
    mesomorph,
    ectomorph,
}) => {
    // Calcular posición del punto en el triángulo
    // Triángulo equilátero con vértices:
    // - Endomorph: (0, altura) - abajo izquierda
    // - Mesomorph: (ancho/2, 0) - arriba centro
    // - Ectomorph: (ancho, altura) - abajo derecha
    const { x, y, dominant, description } = useMemo(() => {
        // Valores por defecto si no hay datos
        const endo = endomorph ?? 0;
        const meso = mesomorph ?? 0;
        const ecto = ectomorph ?? 0;

        // Si todos son 0, centrar el punto
        if (endo === 0 && meso === 0 && ecto === 0) {
            return {
                x: 200,
                y: 150,
                dominant: "No definido",
                description: "No hay datos de somatotipo disponibles.",
            };
        }

        // Normalizar valores (suma total)
        const total = endo + meso + ecto;
        if (total === 0) {
            return {
                x: 200,
                y: 150,
                dominant: "No definido",
                description: "No hay datos de somatotipo disponibles.",
            };
        }

        const endoNorm = endo / total;
        const mesoNorm = meso / total;
        const ectoNorm = ecto / total;

        // Dimensiones del triángulo (SVG viewBox: 0 0 400 300)
        const width = 400;
        const height = 300;
        const triangleHeight = height * 0.8; // 80% de la altura
        const triangleTop = height * 0.1; // 10% desde arriba
        const triangleBottom = triangleTop + triangleHeight;
        const triangleLeft = width * 0.1; // 10% desde la izquierda
        const triangleRight = width * 0.9; // 90% desde la izquierda
        const triangleCenterX = width / 2;

        // Coordenadas de los vértices
        const endoX = triangleLeft;
        const endoY = triangleBottom;
        const mesoX = triangleCenterX;
        const mesoY = triangleTop;
        const ectoX = triangleRight;
        const ectoY = triangleBottom;

        // Calcular posición usando coordenadas baricéntricas
        const x = endoNorm * endoX + mesoNorm * mesoX + ectoNorm * ectoX;
        const y = endoNorm * endoY + mesoNorm * mesoY + ectoNorm * ectoY;

        // Determinar dominante
        let dominant = "Balanceado";
        let description = "Combinación equilibrada de características endomórficas, mesomórficas y ectomórficas.";

        if (endo > meso && endo > ecto) {
            dominant = SOMATOTYPE_DESCRIPTIONS.endomorph.dominant;
            description = SOMATOTYPE_DESCRIPTIONS.endomorph.description;
        } else if (meso > endo && meso > ecto) {
            dominant = SOMATOTYPE_DESCRIPTIONS.mesomorph.dominant;
            description = SOMATOTYPE_DESCRIPTIONS.mesomorph.description;
        } else if (ecto > endo && ecto > meso) {
            dominant = SOMATOTYPE_DESCRIPTIONS.ectomorph.dominant;
            description = SOMATOTYPE_DESCRIPTIONS.ectomorph.description;
        }

        return { x, y, dominant, description };
    }, [endomorph, mesomorph, ectomorph]);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Somatotipo</h3>
                <div className="flex-1 h-0.5 bg-gray-900"></div>
            </div>

            {/* Layout: Gráfico a la izquierda, valores a la derecha */}
            <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
                {/* Gráfico SVG - Izquierda */}
                <div className="flex-shrink-0">
                    <svg
                        viewBox="0 0 400 300"
                        className="w-full max-w-xs h-auto"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Triángulo principal */}
                        <polygon
                            points="40,260 200,30 360,260"
                            fill="none"
                            stroke="#4A67B3"
                            strokeWidth="2"
                        />

                        {/* Etiquetas de vértices */}
                        <text
                            x="40"
                            y="280"
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-700"
                        >
                            Endomorph
                        </text>
                        <text
                            x="200"
                            y="20"
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-700"
                        >
                            Mesomorph
                        </text>
                        <text
                            x="360"
                            y="280"
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-700"
                        >
                            Ectomorph
                        </text>

                        {/* Etiquetas internas */}
                        <text
                            x="120"
                            y="200"
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                        >
                            Soft
                        </text>
                        <text
                            x="200"
                            y="100"
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                        >
                            Muscular
                        </text>
                        <text
                            x="280"
                            y="200"
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                        >
                            Lean
                        </text>

                        {/* Punto del somatotipo */}
                        <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill="#4A67B3"
                            stroke="white"
                            strokeWidth="2"
                        />
                    </svg>
                </div>

                {/* Valores numéricos - Derecha */}
                <div className="flex-1 space-y-3">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Endomorph</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {endomorph ?? "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Mesomorph</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {mesomorph ?? "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Ectomorph</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {ectomorph ?? "—"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Descripción del somatotipo dominante */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="font-semibold text-primary-900 mb-2">{dominant}</p>
                <p className="text-sm text-primary-800">{description}</p>
            </div>
        </div>
    );
};

