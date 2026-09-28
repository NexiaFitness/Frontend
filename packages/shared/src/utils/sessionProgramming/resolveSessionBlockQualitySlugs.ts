/**
 * resolveSessionBlockQualitySlugs.ts — Slugs de cualidades visibles en TrainingBlockSelector (G27 §2.2).
 *
 * Fuente canónica: mix del bloque activo (recommendations) o qualities[] del period block.
 */

import type { PlanPeriodBlock } from "../../types/planningCargas";
import type {
    SessionDayQualityMixItem,
    SessionRecommendationsResponse,
} from "../../types/sessionRecommendations";
import { isDateInRange } from "../periodBlockOverlap";

function dedupeSlugs(slugs: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const slug of slugs) {
        const normalized = slug.trim();
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        out.push(normalized);
    }
    return out;
}

function slugsFromQualityMix(
    mix: readonly SessionDayQualityMixItem[] | null | undefined,
): string[] {
    if (!mix?.length) return [];
    return dedupeSlugs(
        mix.map((item) => item.slug).filter((slug): slug is string => Boolean(slug)),
    );
}

export function extractQualitySlugsFromPeriodBlock(
    block: PlanPeriodBlock | null | undefined,
): string[] {
    if (!block?.qualities?.length) return [];
    return dedupeSlugs(
        block.qualities
            .map((q) => q.physical_quality_slug)
            .filter((slug): slug is string => Boolean(slug)),
    );
}

function findPeriodBlockForDate(
    blocks: readonly PlanPeriodBlock[],
    sessionDate: string,
): PlanPeriodBlock | undefined {
    return blocks.find((block) =>
        isDateInRange(sessionDate, block.start_date, block.end_date),
    );
}

function isRecommendationsWithValues(
    response: SessionRecommendationsResponse | undefined,
): response is Extract<
    SessionRecommendationsResponse,
    { has_planned_values: true }
> {
    return Boolean(
        response &&
            response.has_active_plan &&
            "has_planned_values" in response &&
            response.has_planned_values &&
            response.recommendations,
    );
}

export interface ResolveSessionBlockQualitySlugsInput {
    sessionRecommendations?: SessionRecommendationsResponse;
    sessionDate: string;
    periodBlocks?: readonly PlanPeriodBlock[];
    /** Atajo cuando la sesión ya conoce su period_block_id (editar sesión). */
    periodBlock?: PlanPeriodBlock | null;
}

/**
 * Hasta 4 slugs declarados en la fase activa — chips visibles sin pasar por «+ Añadir cualidad».
 */
export function resolveSessionBlockQualitySlugs(
    input: ResolveSessionBlockQualitySlugsInput,
): string[] {
    const { sessionRecommendations, sessionDate, periodBlocks = [], periodBlock } =
        input;

    if (isRecommendationsWithValues(sessionRecommendations)) {
        const fromMix = slugsFromQualityMix(
            sessionRecommendations.recommendations.quality_mix,
        );
        if (fromMix.length > 0) {
            return fromMix;
        }
    }

    if (periodBlock) {
        const fromBlock = extractQualitySlugsFromPeriodBlock(periodBlock);
        if (fromBlock.length > 0) {
            return fromBlock;
        }
    }

    const blockForDate = findPeriodBlockForDate(periodBlocks, sessionDate);
    return extractQualitySlugsFromPeriodBlock(blockForDate);
}
