/**
 * coherenceMockData.ts — Mock data para Daily Coherence Tab
 *
 * Contexto:
 * - Datos de prueba mientras backend implementa GET /clients/{id}/coherence
 * - Estructura basada en Figma y necesidades del tab
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import type { CoherenceData } from "../types/coherence";

export const MOCK_COHERENCE_DATA: CoherenceData = {
    adherence_percentage: 80,
    sessions_completed: 4,
    sessions_total: 5,
    average_srpe: 7.4,
    monotony: 2.1,
    strain: 840,
    
    prescribed_vs_perceived: [
        { prescribed: 6, perceived: 7 },
        { prescribed: 7, perceived: 8 },
        { prescribed: 8, perceived: 9 },
        { prescribed: 6, perceived: 6 },
        { prescribed: 7, perceived: 9 },
    ],
    
    monotony_by_week: [
        { week: "W1", monotony: 1.8 },
        { week: "W2", monotony: 2.3 },
        { week: "W3", monotony: 1.5 },
        { week: "W4", monotony: 2.5 },
    ],
    
    strain_by_week: [
        { week: "W1", load: 750, strain: 720 },
        { week: "W2", load: 820, strain: 860 },
        { week: "W3", load: 680, strain: 650 },
        { week: "W4", load: 900, strain: 1000 },
    ],
    
    summary: "El cliente muestra buena adherencia (80%) pero percibe las sesiones un 20% más duras de lo prescrito. La monotonía semanal es moderada (2.1): considera añadir más variabilidad de carga para prevenir sobreentrenamiento.",
    
    recommendations: [
        "Incrementar variabilidad del entrenamiento para reducir monotonía y riesgo de lesión",
        "Revisar percepción de esfuerzo: las sesiones se sienten más duras de lo planeado",
        "Considerar semana de descarga si monotonía sigue alta",
    ],
};

