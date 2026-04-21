/**
 * Ejercicio creado solo en sesión (spec Lovable: localAdditions).
 * Se pasa a ExerciseDetail vía React Router location.state.
 */

export interface LocalExerciseView {
    rowId: string;
    nombre: string;
    musculatura_principal: string;
    tipo: string;
    nivel: string;
    equipo: string;
    patron_movimiento: string;
    tipo_carga: string;
    categoria: string;
    descripcion: string | null;
    instrucciones: string | null;
    notas: string | null;
    videoUrl: string | null;
}
