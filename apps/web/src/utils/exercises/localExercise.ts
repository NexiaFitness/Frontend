import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { LocalExerciseView } from "@/types/exerciseLocal";

export function localViewToExercise(v: LocalExerciseView): Exercise {
    return {
        id: 0,
        exercise_id: v.rowId,
        nombre: v.nombre,
        nombre_ingles: null,
        tipo: v.tipo,
        categoria: v.categoria,
        nivel: v.nivel,
        equipo: v.equipo,
        patron_movimiento: v.patron_movimiento,
        tipo_carga: v.tipo_carga,
        musculatura_principal: v.musculatura_principal,
        musculatura_secundaria: null,
        descripcion: v.descripcion,
        instrucciones: v.instrucciones,
        notas: v.notas,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
    };
}
