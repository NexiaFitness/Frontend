/**
 * AI weekly summary types (F3d-BE-01 / F3d-FE-01).
 * Endpoint: POST /api/v1/ai/weekly-summary
 */

export type AiWeeklySummarySource = "llm" | "cache" | "template";

export interface AiWeeklySummaryRequest {
    week_start?: string;
    /** Regenerate even if cache is valid (post-session week closure). */
    force_refresh?: boolean;
}

export interface AiWeeklySummary {
    client_id: number;
    week_start: string;
    week_end: string;
    summary_text: string;
    source: AiWeeklySummarySource;
    generated_at: string;
    model: string | null;
}
