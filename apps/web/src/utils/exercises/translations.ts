/**
 * translations.ts — Traducciones y helpers para módulo Exercises
 *
 * Propósito: Centralizar lógica de traducciones, estilos y labels para ejercicios
 * Contexto: Usado por ExerciseCard, ExerciseFilters, ExerciseDetail
 *
 * Notas:
 * - Helpers consolidados de 3 componentes (ExerciseCard, ExerciseFilters, ExerciseDetail)
 * - Tipos son strings (backend real), no enums
 * - Valores basados en datos del backend legacy (se migrarán a Exercise Catalog en Fase 2.5)
 *
 * @author Nelson / NEXIA Team
 * @since v5.0.0 (Exercise Catalog - Phase 2.1)
 */

/**
 * Traduce grupo muscular a español
 *
 * @param muscle - Nombre del grupo muscular (string del backend)
 * @returns Etiqueta en español o el valor original si no se encuentra
 *
 * @example
 * getMuscleLabel("chest") // "Pecho"
 * getMuscleLabel("back") // "Espalda"
 */
export const getMuscleLabel = (muscle: string): string => {
    const labels: Record<string, string> = {
        chest: "Pecho",
        back: "Espalda",
        legs: "Piernas",
        shoulders: "Hombros",
        arms: "Brazos",
        core: "Core",
        "full_body": "Cuerpo Completo",
        // Variantes comunes del backend
        "full body": "Cuerpo Completo",
        "full-body": "Cuerpo Completo",
    };
    return labels[muscle.toLowerCase()] || muscle;
};

/**
 * Traduce equipamiento a español
 *
 * @param equipment - Nombre del equipamiento (string del backend)
 * @returns Etiqueta en español o el valor original si no se encuentra
 *
 * @example
 * getEquipmentLabel("barbell") // "Barra"
 * getEquipmentLabel("dumbbell") // "Mancuernas"
 */
export const getEquipmentLabel = (equipment: string): string => {
    const labels: Record<string, string> = {
        barbell: "Barra",
        dumbbell: "Mancuernas",
        kettlebell: "Kettlebell",
        "resistance_band": "Banda de Resistencia",
        "resistance band": "Banda de Resistencia",
        bodyweight: "Peso Corporal",
        machine: "Máquina",
        cable: "Cable",
        other: "Otro",
    };
    return labels[equipment.toLowerCase()] || equipment;
};

/**
 * Traduce nivel de dificultad a español
 *
 * @param level - Nivel de dificultad (string del backend)
 * @returns Etiqueta en español o el valor original si no se encuentra
 *
 * @example
 * getLevelLabel("beginner") // "Principiante"
 * getLevelLabel("intermediate") // "Intermedio"
 */
export const getLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
        beginner: "Principiante",
        intermediate: "Intermedio",
        advanced: "Avanzado",
    };
    return labels[level.toLowerCase()] || level;
};

/**
 * Obtiene clases CSS para badge de nivel de dificultad
 *
 * @param level - Nivel de dificultad (string del backend)
 * @returns Clases CSS de Tailwind para el badge
 *
 * @example
 * getLevelBadgeColor("beginner") // "bg-green-100 text-green-700"
 * getLevelBadgeColor("intermediate") // "bg-yellow-100 text-yellow-700"
 */
export const getLevelBadgeColor = (level: string): string => {
    const colors: Record<string, string> = {
        beginner: "bg-green-100 text-green-700",
        intermediate: "bg-yellow-100 text-yellow-700",
        advanced: "bg-red-100 text-red-700",
    };
    return colors[level.toLowerCase()] || "bg-gray-100 text-gray-700";
};

/**
 * Obtiene clases CSS para gradiente de fondo según grupo muscular
 *
 * @param muscle - Nombre del grupo muscular (string del backend)
 * @returns Clases CSS de Tailwind para gradiente (formato: "from-X to-Y")
 *
 * @example
 * getMuscleGradient("chest") // "from-red-400 to-red-600"
 * getMuscleGradient("back") // "from-blue-400 to-blue-600"
 */
export const getMuscleGradient = (muscle: string): string => {
    const gradients: Record<string, string> = {
        chest: "from-red-400 to-red-600",
        back: "from-blue-400 to-blue-600",
        legs: "from-green-400 to-green-600",
        shoulders: "from-purple-400 to-purple-600",
        arms: "from-orange-400 to-orange-600",
        core: "from-yellow-400 to-yellow-600",
        "full_body": "from-indigo-400 to-indigo-600",
        "full body": "from-indigo-400 to-indigo-600",
        "full-body": "from-indigo-400 to-indigo-600",
    };
    return gradients[muscle.toLowerCase()] || "from-gray-400 to-gray-600";
};

