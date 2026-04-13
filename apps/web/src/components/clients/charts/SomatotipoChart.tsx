/**
 * SomatotipoChart.tsx — Gráfico triangular de somatotipo
 *
 * Visualiza el somatotipo del cliente en un triángulo SVG.
 * Valores: Endomorfo, Mesomorfo, Ectomorfo (1-7 cada uno).
 * Diseñado con tokens dark-mode de Nexia Sparkle Flow.
 *
 * @author Frontend Team
 * @since v6.0.0
 * @updated v8.0.0 - Rediseño dark-mode tokens, español, sin card wrapper propio
 */

import React, { useMemo } from "react";

interface SomatotipoChartProps {
    endomorph: number | null | undefined;
    mesomorph: number | null | undefined;
    ectomorph: number | null | undefined;
}

interface SomatotypeInfo {
    dominant: string;
    description: string;
}

const SOMATOTYPE_INFO: Record<string, SomatotypeInfo> = {
    endomorph: {
        dominant: "Endomorfo dominante",
        description: "Tendencia a acumular grasa corporal con estructura ósea mayor. Responde bien a entrenamiento de resistencia y control calórico.",
    },
    mesomorph: {
        dominant: "Mesomorfo dominante",
        description: "Estructura muscular natural con físico atlético. Responde eficientemente al entrenamiento de fuerza y desarrolla músculo con facilidad.",
    },
    ectomorph: {
        dominant: "Ectomorfo dominante",
        description: "Estructura delgada con poca grasa y músculo. Responde bien a entrenamiento de fuerza con enfoque en volumen y nutrición.",
    },
    balanced: {
        dominant: "Balanceado",
        description: "Combinación equilibrada de características endomórficas, mesomórficas y ectomórficas.",
    },
    unknown: {
        dominant: "Sin datos",
        description: "No hay datos de somatotipo disponibles todavía.",
    },
};

const TRI_TOP = 30;
const TRI_BOTTOM = 260;
const TRI_LEFT = 40;
const TRI_RIGHT = 360;
const TRI_CENTER_X = 200;

export const SomatotipoChart: React.FC<SomatotipoChartProps> = ({
    endomorph,
    mesomorph,
    ectomorph,
}) => {
    const { x, y, dominant, description } = useMemo(() => {
        // Si falta algún componente, no se puede representar un somatotipo válido.
        if (
            endomorph == null ||
            mesomorph == null ||
            ectomorph == null
        ) {
            return { x: TRI_CENTER_X, y: 150, ...SOMATOTYPE_INFO.unknown };
        }

        const endo = endomorph;
        const meso = mesomorph;
        const ecto = ectomorph;
        const total = endo + meso + ecto;

        if (total === 0) {
            return { x: TRI_CENTER_X, y: 150, ...SOMATOTYPE_INFO.unknown };
        }

        const eN = endo / total;
        const mN = meso / total;
        const ecN = ecto / total;

        const px = eN * TRI_LEFT + mN * TRI_CENTER_X + ecN * TRI_RIGHT;
        const py = eN * TRI_BOTTOM + mN * TRI_TOP + ecN * TRI_BOTTOM;

        let info = SOMATOTYPE_INFO.balanced;
        if (endo > meso && endo > ecto) info = SOMATOTYPE_INFO.endomorph;
        else if (meso > endo && meso > ecto) info = SOMATOTYPE_INFO.mesomorph;
        else if (ecto > endo && ecto > meso) info = SOMATOTYPE_INFO.ectomorph;

        return { x: px, y: py, ...info };
    }, [endomorph, mesomorph, ectomorph]);

    return (
        <div className="space-y-5">
            {/* Chart + values */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* SVG triangle */}
                <div className="w-full max-w-[260px] shrink-0">
                    <svg viewBox="0 0 400 300" className="h-auto w-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Grid lines (subtle) */}
                        <line x1={TRI_LEFT} y1={TRI_BOTTOM} x2={TRI_CENTER_X} y2={TRI_TOP} stroke="hsl(var(--primary) / .12)" strokeWidth="1" />
                        <line x1={TRI_CENTER_X} y1={TRI_TOP} x2={TRI_RIGHT} y2={TRI_BOTTOM} stroke="hsl(var(--primary) / .12)" strokeWidth="1" />
                        <line x1={TRI_RIGHT} y1={TRI_BOTTOM} x2={TRI_LEFT} y2={TRI_BOTTOM} stroke="hsl(var(--primary) / .12)" strokeWidth="1" />

                        {/* Main triangle */}
                        <polygon
                            points={`${TRI_LEFT},${TRI_BOTTOM} ${TRI_CENTER_X},${TRI_TOP} ${TRI_RIGHT},${TRI_BOTTOM}`}
                            fill="hsl(var(--primary) / .06)"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />

                        {/* Inner labels */}
                        <text x="120" y="205" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">Suave</text>
                        <text x={TRI_CENTER_X} y="105" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">Muscular</text>
                        <text x="280" y="205" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">Delgado</text>

                        {/* Vertex labels */}
                        <text x={TRI_LEFT} y="285" textAnchor="middle" fontSize="12" fontWeight="500" fill="hsl(var(--foreground))">Endomorfo</text>
                        <text x={TRI_CENTER_X} y="18" textAnchor="middle" fontSize="12" fontWeight="500" fill="hsl(var(--foreground))">Mesomorfo</text>
                        <text x={TRI_RIGHT} y="285" textAnchor="middle" fontSize="12" fontWeight="500" fill="hsl(var(--foreground))">Ectomorfo</text>

                        {/* Data point with glow */}
                        <circle cx={x} cy={y} r="12" fill="hsl(var(--primary) / .25)" />
                        <circle cx={x} cy={y} r="6" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
                    </svg>
                </div>

                {/* Numeric values */}
                <div className="flex w-full gap-6 sm:flex-col sm:gap-4">
                    <ValuePill label="Endomorfo" value={endomorph} />
                    <ValuePill label="Mesomorfo" value={mesomorph} />
                    <ValuePill label="Ectomorfo" value={ectomorph} />
                </div>
            </div>

            {/* Dominant description */}
            <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3">
                <p className="text-sm font-semibold text-primary">{dominant}</p>
                <p className="mt-1 text-xs leading-relaxed text-primary/80">{description}</p>
            </div>
        </div>
    );
};

function ValuePill({ label, value }: { label: string; value: number | null | undefined }) {
    return (
        <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-base font-semibold text-foreground">{value ?? "—"}</p>
        </div>
    );
}
