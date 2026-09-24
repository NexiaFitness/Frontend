/**
 * Handlers MSW — Admin catalog bundle / review / history (M5).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";

const now = "2026-09-24T12:00:00.000Z";

export const mockCatalogExercise = {
    id: 11,
    exercise_id: "squat_back",
    nombre: "Sentadilla trasera",
    nombre_ingles: "Back squat",
    tipo: "multiarticular",
    nivel: "intermediate",
    equipo: "barbell",
    patron_movimiento: "squat",
    tipo_carga: "external",
    musculatura_principal: "Cuádriceps",
    musculatura_secundaria: null,
    laterality: "bilateral",
    axial_load: "high",
    descripcion: null,
    instrucciones: null,
    notas: null,
    created_at: now,
    updated_at: now,
    is_active: true,
    muscles: [
        {
            id: 1,
            name: "Cuadriceps",
            name_en: "Quadriceps",
            name_es: "Cuádriceps",
            role: "prime_mover",
            priority: 1,
        },
    ],
    movement_patterns: [
        {
            id: 1,
            name_en: "Squat",
            name_es: "Sentadilla",
            role: "primary",
        },
    ],
    equipment: [{ id: 1, name_en: "Barbell", name_es: "Barra" }],
    tags: [],
    joint_action_details: [
        {
            id: 1,
            joint_id: 2,
            action_id: 1,
            role: "primary",
            joint_name_es: "Rodilla",
            action_name_es: "Flexión",
        },
    ],
    review_status: "pending",
    catalog_reviewed_at: null,
    catalog_reviewed_by_user_id: null,
};

export const getExerciseCatalogHandler = http.get(
    "*/exercises/:id/catalog",
    async ({ params }) => {
        return HttpResponse.json(
            { ...mockCatalogExercise, id: Number(params.id) || 11 },
            { status: 200 }
        );
    }
);

export const createExerciseCatalogHandler = http.post("*/exercises/catalog", async () => {
    return HttpResponse.json(mockCatalogExercise, { status: 201 });
});

export const updateExerciseCatalogHandler = http.put(
    "*/exercises/:id/catalog",
    async ({ params }) => {
        return HttpResponse.json(
            {
                ...mockCatalogExercise,
                id: Number(params.id) || 11,
                updated_at: "2026-09-24T13:00:00.000Z",
            },
            { status: 200 }
        );
    }
);

export const updateExerciseCatalogConflictHandler = http.put(
    "*/exercises/:id/catalog",
    async () => {
        return HttpResponse.json(
            {
                detail: {
                    detail: "CONCURRENT_MODIFICATION",
                    server_updated_at: "2026-09-24T14:00:00.000Z",
                    expected_updated_at: now,
                    diff_summary: { nombre: true },
                },
            },
            { status: 409 }
        );
    }
);

export const markCatalogReviewedHandler = http.post(
    "*/admin/catalog/exercises/:pk/review",
    async ({ params }) => {
        return HttpResponse.json(
            {
                exercise_pk: Number(params.pk),
                exercise_code: "squat_back",
                review_status: "reviewed",
                catalog_reviewed_at: now,
                catalog_reviewed_by_user_id: 1,
            },
            { status: 200 }
        );
    }
);

export const getCatalogHistoryHandler = http.get(
    "*/admin/catalog/exercises/:pk/history",
    async ({ params }) => {
        return HttpResponse.json(
            {
                exercise_pk: Number(params.pk),
                entries: [
                    {
                        id: 1,
                        field_path: "muscles.priority",
                        old_value: "0",
                        new_value: "1",
                        actor_user_id: 1,
                        actor_label: "admin@test.com",
                        created_at: now,
                    },
                ],
            },
            { status: 200 }
        );
    }
);

export const getCatalogHistoryEmptyHandler = http.get(
    "*/admin/catalog/exercises/:pk/history",
    async ({ params }) => {
        return HttpResponse.json(
            { exercise_pk: Number(params.pk), entries: [] },
            { status: 200 }
        );
    }
);

const refNow = now;

export const getMovementPatternsHandler = http.get(
    "*/exercise-catalog/movement-patterns/",
    async () =>
        HttpResponse.json(
            [
                {
                    id: 1,
                    name_en: "Squat",
                    name_es: "Sentadilla",
                    description: null,
                    ui_bucket: "LOWER",
                    is_active: true,
                    created_at: refNow,
                    updated_at: refNow,
                },
            ],
            { status: 200 }
        )
);

export const getEquipmentCatalogHandler = http.get(
    "*/exercise-catalog/equipment/",
    async () =>
        HttpResponse.json(
            [
                {
                    id: 1,
                    name_en: "Barbell",
                    name_es: "Barra",
                    description: null,
                    is_active: true,
                    created_at: refNow,
                    updated_at: refNow,
                },
            ],
            { status: 200 }
        )
);

export const getTagsCatalogHandler = http.get("*/exercise-catalog/tags/", async () =>
    HttpResponse.json([], { status: 200 })
);

export const getActionsCatalogHandler = http.get("*/exercise-catalog/actions/", async () =>
    HttpResponse.json(
        [
            {
                id: 1,
                name: "Flexion",
                name_en: "Flexion",
                name_es: "Flexión",
                is_active: true,
                created_at: refNow,
            },
        ],
        { status: 200 }
    )
);

export const adminCatalogHandlers = [
    getExerciseCatalogHandler,
    createExerciseCatalogHandler,
    updateExerciseCatalogHandler,
    markCatalogReviewedHandler,
    getCatalogHistoryHandler,
    getMovementPatternsHandler,
    getEquipmentCatalogHandler,
    getTagsCatalogHandler,
    getActionsCatalogHandler,
];
