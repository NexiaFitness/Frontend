/**
 * spanishUiAccentGuard.ts — Detecta palabras españolas visibles sin tilde (B-20).
 * No corrige: solo señala. Usar en tests de copy/presentation.
 */

/** Singular / formas que en UI deben llevar tilde. Plurals -iones no van aquí. */
export const SPANISH_UI_UNACCENTED_STEMS = [
    "sesion",
    "tecnica",
    "tecnicas",
    "evaluacion",
    "planificacion",
    "descripcion",
    "informacion",
    "configuracion",
    "duracion",
    "atencion",
    "ejecucion",
    "ubicacion",
    "edicion",
    "confirmacion",
    "notificacion",
    "asignacion",
    "ultima",
    "ultimo",
    "proxima",
    "proximo",
    "maquina",
    "maquinas",
    "comunicacion",
    "periodizacion",
    "validacion",
    "replicacion",
    "fisiologica",
    "fisiologicas",
    "valoracion",
    "calificacion",
    "intencion",
    "alineacion",
    "prescripcion",
    "observacion",
    "lesion",
    "seccion",
    "opcion",
    "accion",
    "relacion",
    "solucion",
    "direccion",
    "conexion",
    "autenticacion",
    "autorizacion",
    "navegacion",
    "organizacion",
    "recomendacion",
    "satisfaccion",
    "minimo",
    "maximo",
    "codigo",
    "indice",
    "pagina",
    "telefono",
    "musculo",
    "musculos",
    "autonoma",
    "autonomo",
    "segun",
    "tambien",
    "despues",
] as const;

const STEM_RE = new RegExp(
    `\\b(${SPANISH_UI_UNACCENTED_STEMS.join("|")})\\b`,
    "gi",
);

/** «dia» solo cuando parece calendario (del/el/un/al/por día), no «media». */
const DIA_RE = /\b(?:del|el|un|al|por|este|cada)\s+dia\b/gi;

export function findUnaccentedSpanishUiWords(text: string): string[] {
    const found = new Set<string>();
    for (const m of text.matchAll(STEM_RE)) {
        found.add(m[1]!.toLowerCase());
    }
    for (const m of text.matchAll(DIA_RE)) {
        found.add(m[0]!.toLowerCase());
    }
    return [...found].sort();
}

export function assertAccentedSpanishUi(text: string, label = "copy"): void {
    const hits = findUnaccentedSpanishUiWords(text);
    if (hits.length > 0) {
        throw new Error(
            `${label}: falta tilde en UI (${hits.join(", ")}): ${text.slice(0, 160)}`,
        );
    }
}
