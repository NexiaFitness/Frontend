/**
 * Copy del panel de volumen — programado vs registrado/ejecutado.
 * Regla: nunca mezclar métricas; etiquetar siempre la fuente de datos.
 */

/** Volumen muscular en constructor y validación de sesión (review). */
export const VOLUME_MUSCLE_PROGRAMMED_NOTE =
    "Series equivalentes programadas en el constructor. No refleja lo ejecutado por el atleta.";

export const VOLUME_REVIEW_SECTION_TITLE = "Volumen programado por grupo muscular";

export const VOLUME_REVIEW_GROUPS_HEADING = "Volumen programado en esta sesión";

export const VOLUME_REVIEW_KPI_ARIA = "Resumen de volumen programado de la sesión";

export const VOLUME_REVIEW_KPI_GROUPS_LABEL = "Grupos con series programadas";

export const VOLUME_REVIEW_KPI_SERIES_LABEL = "Series programadas hoy";

export const VOLUME_REVIEW_KPI_SERIES_HINT = "Programadas frente al objetivo del día";

export const VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE =
    "Borrador programado vs reparto orientativo de esta sesión (plan semanal)";

export const VOLUME_WEEKLY_SAVED_SUBTITLE =
    "Acumulado semanal programado según sesiones guardadas y objetivos del plan";

/** Nota de método de conteo — solo volumen planificado (D1/D1b). */
export const VOLUME_COUNTING_METHOD_NOTE =
    "Series equivalentes programadas por grupo muscular: prime_mover cuenta directo (entero); synergist indirecto (×0,5, sin truncar) salvo D1b en el mismo grupo. Estabilizadores no suman. Solo prescripción planificada guardada con mapeo en catálogo — no ejecutado.";

export const VOLUME_COVERAGE_EMPTY_WEEK =
    "Semana vacía: no hay sesiones programadas guardadas en este rango.";

export const VOLUME_COVERAGE_NO_EVALUABLE =
    "Sin datos evaluables: hay sesiones pero ningún ejercicio aporta volumen muscular (revisa mapeo en catálogo).";

export const VOLUME_COVERAGE_PARTIAL_WEEK =
    "Semana incompleta: hay volumen evaluable pero menos sesiones guardadas que la frecuencia del cliente.";

export const VOLUME_PRIOR_WEEK_NONE = "Sin semana anterior comparable";
