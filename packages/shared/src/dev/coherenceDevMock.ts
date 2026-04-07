/**
 * Respuesta simulada de GET /clients/:id/coherence solo en desarrollo UI.
 * Permite revisar cards y gráficos sin depender del backend.
 */

import type {
    DailyCoherenceAnalyticsOut,
    AdherenceDataPoint,
    MonotonyStrainDataPoint,
    SRPEPoint,
} from "../types/coherence";

type CoherenceQueryArg = {
    clientId: number;
    week?: string;
    periodStart?: string;
    periodEnd?: string;
    periodType?: "week" | "month" | "training_block" | "year";
};

const mulberry32 = (seed: number) => {
    let a = seed >>> 0;
    return () => {
        a += 0x6d2b79f5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const seedFrom = (parts: string[]): number => {
    let h = 2166136261;
    const s = parts.join("|");
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const atNoon = (ymd: string): Date => new Date(`${ymd}T12:00:00`);

const formatYmd = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const addDays = (ymd: string, n: number): string => {
    const d = atNoon(ymd);
    d.setDate(d.getDate() + n);
    return formatYmd(d);
};

const dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

const parseDevMockClientIds = (): Set<number> => {
    try {
        const env = (import.meta as { env?: Record<string, string | undefined> }).env;
        const raw = env?.VITE_COHERENCE_DEV_MOCK_CLIENT_IDS?.trim();
        if (!raw) return new Set([331]);
        const ids = raw
            .split(/[,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((n) => !Number.isNaN(n) && n > 0);
        return new Set(ids.length ? ids : [331]);
    } catch {
        return new Set([331]);
    }
};

let cachedIds: Set<number> | null = null;

export function shouldServeCoherenceDevMock(clientId: number): boolean {
    try {
        const env = (import.meta as { env?: { DEV?: boolean; MODE?: string } }).env;
        if (!env?.DEV) return false;
    } catch {
        return false;
    }
    if (cachedIds === null) cachedIds = parseDevMockClientIds();
    return cachedIds.has(clientId);
}

function fallbackWeekRange(): { start: string; end: string } {
    const now = new Date();
    const dow = now.getDay();
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(12, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: formatYmd(monday), end: formatYmd(sunday) };
}

/** Genera DailyCoherenceAnalyticsOut acorde al periodo solicitado por la pestaña. */
export function buildCoherenceDevMockResponse(arg: CoherenceQueryArg): DailyCoherenceAnalyticsOut {
    const periodType = arg.periodType ?? "week";
    const hasRange = Boolean(arg.periodStart?.trim() && arg.periodEnd?.trim());
    const { start: fbStart, end: fbEnd } = fallbackWeekRange();
    const periodStart = hasRange ? arg.periodStart!.trim() : fbStart;
    const periodEnd = hasRange ? arg.periodEnd!.trim() : fbEnd;

    const rng = mulberry32(seedFrom([String(arg.clientId), periodType, periodStart, periodEnd]));

    const monotonyStrainFromDays = (
        startYmd: string,
        dayOffsets: readonly number[]
    ): MonotonyStrainDataPoint[] => {
        let cumulative = 0;
        return dayOffsets.map((off, index) => {
            const ymd = addDays(startYmd, off);
            const monotony = Math.min(2.85, 1.25 + rng() * 1.35);
            const period_load = Math.round((4 + rng() * 5) * 10) / 10;
            const strain = Math.round(period_load * monotony * 10) / 10;
            cumulative += strain;
            return {
                period_start: ymd,
                period_label: `P${index + 1}`,
                monotony: Math.round(monotony * 100) / 100,
                strain,
                period_load,
                cumulative_strain: Math.round(cumulative * 10) / 10,
            };
        });
    };

    let monotony_strain_data: MonotonyStrainDataPoint[];
    let adherence_data: AdherenceDataPoint[];
    let srpe_scatter_data: SRPEPoint[];
    let summaryLabel: string;

    if (periodType === "week") {
        const offsets = [0, 1, 2, 3, 4, 5, 6] as const;
        monotony_strain_data = monotonyStrainFromDays(periodStart, offsets);
        adherence_data = offsets.map((off) => {
            const ymd = addDays(periodStart, off);
            const dayIx = atNoon(ymd).getDay();
            const completed = rng() > 0.28;
            return {
                period: dayNamesShort[dayIx],
                adherence: completed ? 100 : 0,
            };
        });
        summaryLabel = "semana";
        let sid = 1;
        srpe_scatter_data = [];
        for (const off of offsets) {
            if (rng() > 0.35) {
                const ymd = addDays(periodStart, off);
                const prescribed = Math.round((5 + rng() * 4) * 10) / 10;
                const perceived = Math.min(
                    10,
                    Math.max(1, Math.round((prescribed + (rng() - 0.45) * 2.2) * 10) / 10)
                );
                srpe_scatter_data.push({
                    prescribed_srpe: prescribed,
                    perceived_srpe: perceived,
                    session_date: ymd,
                    session_id: sid++,
                });
            }
        }
        if (srpe_scatter_data.length < 4) {
            const ymd = addDays(periodStart, 2);
            srpe_scatter_data.push(
                { prescribed_srpe: 7, perceived_srpe: 7.8, session_date: ymd, session_id: sid++ },
                { prescribed_srpe: 6.5, perceived_srpe: 6.1, session_date: addDays(periodStart, 4), session_id: sid++ }
            );
        }
    } else if (periodType === "month") {
        const start = atNoon(periodStart);
        const end = atNoon(periodEnd);
        const offsets: number[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
            offsets.push(Math.round((+d - +start) / 86400000));
        }
        if (offsets.length < 4) {
            const span = Math.max(1, Math.round((+end - +start) / 86400000));
            for (let i = 0; i < 4; i++) offsets.push(Math.min(span, Math.floor((span * i) / 3)));
        }
        monotony_strain_data = monotonyStrainFromDays(periodStart, offsets);
        adherence_data = offsets.map((off, i) => ({
            period: `S${i + 1}`,
            adherence: Math.round(55 + rng() * 45),
        }));
        summaryLabel = "mes";
        srpe_scatter_data = [];
        let sid = 1;
        for (let i = 0; i < 12; i++) {
            const ymd = addDays(periodStart, Math.min(i * 2, 27));
            if (atNoon(ymd) > end) break;
            const prescribed = Math.round((5.5 + rng() * 3.8) * 10) / 10;
            const perceived = Math.min(
                10,
                Math.max(1, Math.round((prescribed + (rng() - 0.5) * 2.4) * 10) / 10)
            );
            srpe_scatter_data.push({ prescribed_srpe: prescribed, perceived_srpe: perceived, session_date: ymd, session_id: sid++ });
        }
    } else if (periodType === "year") {
        const y0 = atNoon(periodStart).getFullYear();
        const monthStarts: string[] = [];
        for (let m = 0; m < 12; m++) {
            monthStarts.push(formatYmd(new Date(y0, m, 1, 12, 0, 0, 0)));
        }
        const startRef = atNoon(periodStart);
        const monthOffsets = monthStarts.map((ms) =>
            Math.round((+atNoon(ms) - +startRef) / 86400000)
        );
        monotony_strain_data = monotonyStrainFromDays(periodStart, monthOffsets);
        adherence_data = monthStarts.map((_, i) => ({
            period: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
            adherence: Math.round(52 + rng() * 46),
        }));
        summaryLabel = "año";
        srpe_scatter_data = [];
        let sid = 1;
        for (let m = 0; m < 12; m++) {
            for (let k = 0; k < 2; k++) {
                const day = 3 + k * 10;
                const ymd = formatYmd(new Date(y0, m, Math.min(day, 28), 12, 0, 0, 0));
                const prescribed = Math.round((5.8 + rng() * 3.4) * 10) / 10;
                const perceived = Math.min(
                    10,
                    Math.max(1, Math.round((prescribed + (rng() - 0.48) * 2) * 10) / 10)
                );
                srpe_scatter_data.push({ prescribed_srpe: prescribed, perceived_srpe: perceived, session_date: ymd, session_id: sid++ });
            }
        }
    } else {
        const start = atNoon(periodStart);
        const end = atNoon(periodEnd);
        const spanDays = Math.max(1, Math.round((+end - +start) / 86400000));
        const n = Math.min(14, Math.max(4, Math.ceil(spanDays / 7)));
        const offsets = Array.from({ length: n }, (_, i) => i * 7);
        monotony_strain_data = monotonyStrainFromDays(periodStart, offsets);
        adherence_data = offsets.map((_, i) => ({
            period: `S${i + 1}`,
            adherence: Math.round(60 + rng() * 38),
        }));
        summaryLabel = "bloque";
        srpe_scatter_data = [];
        let sid = 1;
        for (let i = 0; i < n * 2; i++) {
            const off = Math.min(spanDays, Math.floor((spanDays * i) / (n * 2)));
            const ymd = addDays(periodStart, off);
            if (atNoon(ymd) > end) continue;
            const prescribed = Math.round((6 + rng() * 3.2) * 10) / 10;
            const perceived = Math.min(
                10,
                Math.max(1, Math.round((prescribed + (rng() - 0.42) * 2.5) * 10) / 10)
            );
            srpe_scatter_data.push({ prescribed_srpe: prescribed, perceived_srpe: perceived, session_date: ymd, session_id: sid++ });
        }
        if (srpe_scatter_data.length < 6) {
            srpe_scatter_data.push(
                {
                    prescribed_srpe: 7,
                    perceived_srpe: 8.1,
                    session_date: periodStart,
                    session_id: sid++,
                },
                {
                    prescribed_srpe: 8,
                    perceived_srpe: 7.4,
                    session_date: addDays(periodStart, Math.min(14, spanDays)),
                    session_id: sid++,
                }
            );
        }
    }

    const completedDays = adherence_data.filter((a) => a.adherence >= 80).length;
    const adherence_percentage = Math.round(
        (completedDays / Math.max(1, adherence_data.length)) * 100
    );
    const lastMs = monotony_strain_data[monotony_strain_data.length - 1];
    const avgMonotony =
        monotony_strain_data.reduce((s, p) => s + p.monotony, 0) / monotony_strain_data.length;
    const avgSrpe =
        srpe_scatter_data.reduce((s, p) => s + p.perceived_srpe, 0) / srpe_scatter_data.length;

    return {
        client_id: arg.clientId,
        period_start: periodStart,
        period_end: periodEnd,
        period_type: periodType,
        kpis: {
            adherence_percentage: Math.min(100, Math.max(38, adherence_percentage)),
            average_srpe: Math.round(avgSrpe * 10) / 10,
            monotony: Math.round(avgMonotony * 100) / 100,
            strain: lastMs ? Math.round(lastMs.cumulative_strain * 10) / 10 : 0,
        },
        adherence_data,
        srpe_scatter_data,
        monotony_strain_data,
        interpretive_summary: `Vista de diseño (mock dev): coherencia del ${summaryLabel} con adherencia estable, variación de carga y sesiones suficientes para gráficos.`,
        key_recommendations: periodType === "week"
            ? ["Mantener 1 día de descanso activo si el sRPE sube dos sesiones seguidas.", "Ajustar volumen si la monotonía supera el umbral."]
            : periodType === "month"
                ? ["Revisar acumulación mensual: alternar semanas más ligeras.", "Contrastar sensaciones con la prescripción en las semanas pico."]
                : periodType === "year"
                    ? ["Planificar mesociclos con semanas de descarga trimestral.", "Seguir evolución del scatter prescrito vs percibido."]
                    : ["Usar el bloque para modular intensidad entre fases.", "Priorizar recuperación si strain acumulado acelera."],
    };
}
