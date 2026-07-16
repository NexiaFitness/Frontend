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
 * Mapa canónico EN → ES alineado con catálogo (hoja 11.6, 26 equipos).
 * @see docs/catalogo-ejercicios/01_INVENTARIO_EXCEL_BD_VISTA.md
 */
export const EQUIPMENT_NAME_EN_TO_ES: Record<string, string> = {
    bodyweight: "peso corporal",
    barbell: "barra",
    dumbbell: "mancuerna",
    kettlebell: "kettlebell",
    machine: "máquina",
    cable: "polea",
    resistance_band: "banda elástica",
    "resistance band": "banda elástica",
    medicine_ball: "balón medicinal",
    "medicine ball": "balón medicinal",
    smith_machine: "multipower",
    "smith machine": "multipower",
    trap_bar: "barra hexagonal",
    "trap bar": "barra hexagonal",
    ez_bar: "barra EZ",
    "ez bar": "barra EZ",
    landmine: "landmine",
    bench: "banco",
    pull_up_bar: "barra de dominadas",
    "pull up bar": "barra de dominadas",
    rings: "anillas",
    trx: "trx",
    box: "cajón",
    sled: "trineo",
    rower: "remo ergómetro",
    bike: "bici",
    skierg: "skierg",
    bumper_plates: "discos bumper",
    "bumper plates": "discos bumper",
    foam_roller: "foam roller",
    "foam roller": "foam roller",
    yoga_mat: "esterilla",
    "yoga mat": "esterilla",
    sandbag: "saco",
    jump_rope: "comba",
    "jump rope": "comba",
    other: "otro",
    none: "",
};

function normalizeEquipmentKey(equipment: string): string {
    return equipment.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Traduce equipamiento a español
 *
 * @param equipment - Slug EN del backend o token legacy (`bench`, `barbell`)
 * @returns Etiqueta en español del catálogo, o el valor original si ya está en ES
 *
 * @example
 * getEquipmentLabel("barbell") // "barra"
 * getEquipmentLabel("bench") // "banco"
 */
export const getEquipmentLabel = (equipment: string): string => {
    const trimmed = equipment.trim();
    if (!trimmed) return "";

    const lowered = trimmed.toLowerCase();
    if (lowered === "none") return "";

    const underscored = normalizeEquipmentKey(trimmed);
    const spaced = trimmed.toLowerCase();

    return (
        EQUIPMENT_NAME_EN_TO_ES[underscored] ??
        EQUIPMENT_NAME_EN_TO_ES[spaced] ??
        trimmed
    );
};

/**
 * Traduce una línea legacy con uno o varios equipos separados por coma.
 * Idempotente si la línea ya viene en español desde el catálogo (auto-suggest).
 */
export function formatEquipmentLabelLine(equipo: string): string {
    if (!equipo.trim()) return "";
    return equipo
        .split(/[,;/]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => getEquipmentLabel(part))
        .filter(Boolean)
        .join(", ");
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









