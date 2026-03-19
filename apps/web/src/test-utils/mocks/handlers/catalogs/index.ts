/**
 * Handlers MSW para endpoints de catálogos (physical-qualities, etc.)
 *
 * Usados por PlanningTab (QualitiesEditor), ExerciseForm, etc.
 *
 * @author Frontend Team
 * @since Fase 5
 */

import { http, HttpResponse } from "msw";

const MOCK_PHYSICAL_QUALITIES = [
    { id: 1, name: "Fuerza", slug: "strength", modality: "strength", has_volume: true, display_order: 1 },
    { id: 2, name: "Resistencia", slug: "endurance", modality: "endurance", has_volume: false, display_order: 2 },
];

export const getPhysicalQualitiesHandler = http.get("*/catalogs/physical-qualities", async () => {
    return HttpResponse.json(MOCK_PHYSICAL_QUALITIES, { status: 200 });
});

export const catalogsHandlers = [getPhysicalQualitiesHandler];
