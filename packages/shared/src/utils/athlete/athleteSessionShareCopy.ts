/**
 * athleteSessionShareCopy.ts — Texto share V06 post-sesión (F3b-FE-04).
 * Lógica pura; sin DOM ni Web Share API.
 */

import type { PostSessionReport } from "../../types/trainingSessions";
import { formatAthleteDateLong } from "./athleteSessionUtils";

const SHARE_BRAND_FOOTER = "— NEXIA Fitness";
const MAX_HIGHLIGHTS = 3;

export interface PostSessionSharePayload {
    title: string;
    text: string;
}

function formatDurationMinutes(minutes: number): string {
    const rounded = Math.round(minutes);
    return rounded === 1 ? "1 min" : `${rounded} min`;
}

/**
 * Construye título y cuerpo para Web Share / clipboard desde PostSessionReport.
 */
export function buildPostSessionSharePayload(report: PostSessionReport): PostSessionSharePayload {
    const pct = Math.round(report.completion_percentage);
    const title = `Mi entrenamiento — ${report.session_name}`;

    const lines: string[] = [`🏋️ Sesión completada — ${report.session_name}`];

    if (report.session_date) {
        lines.push(`📅 ${formatAthleteDateLong(report.session_date)}`);
    }

    lines.push(`✅ Cumplimiento: ${pct}%`);
    lines.push(`📊 ${report.total_actual_sets}/${report.total_planned_sets} series`);

    if (report.actual_duration != null && report.actual_duration > 0) {
        lines.push(`⏱ ${formatDurationMinutes(report.actual_duration)}`);
    }

    const highlights = report.highlights.slice(0, MAX_HIGHLIGHTS);
    if (highlights.length > 0) {
        lines.push("");
        for (const line of highlights) {
            lines.push(`• ${line}`);
        }
    }

    lines.push("");
    lines.push(SHARE_BRAND_FOOTER);

    return {
        title,
        text: lines.join("\n"),
    };
}
