/**
 * trainingBlockDisplay.ts — Nombres de bloque de entrenamiento en UI.
 * Contexto: etiquetas en constructores por tipo de serie.
 * @author Frontend Team
 * @since v5.3.0
 */

const BLOCK_TYPE_TRANSLATIONS: Record<string, string> = {
    "Warm Up": "Calentamiento",
    Core: "Core",
    Conditioning: "Acondicionamiento",
    "Maximum Strength": "Fuerza Máxima",
    "Strength-Speed": "Fuerza-Velocidad",
    "Hypertrophy Strength": "Hipertrofia",
    Plyometrics: "Pliometría",
    "Intensive Aerobic": "Aeróbico Intensivo",
    "Extensive Aerobic": "Aeróbico Extensivo",
};

export function getTrainingBlockDisplayName(name: string): string {
    return BLOCK_TYPE_TRANSLATIONS[name] ?? name;
}
