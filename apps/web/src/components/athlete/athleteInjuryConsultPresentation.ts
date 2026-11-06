/**
 * athleteInjuryConsultPresentation.ts — Copy de la consulta de limitaciones.
 *
 * Consultar abre el listado registrado. No envía un mensaje. Las molestias
 * se anotan en la sesión y, al terminarla, en el feedback ya existente.
 */

export const ATHLETE_INJURY_CONSULT_COPY = {
    action: "Consultar",
    bannerPain:
        "Si sientes dolor, para. Anótalo en las notas de la sesión y, al terminarla, cuéntalo en el feedback.",
    sheetIntro:
        "Estas son las limitaciones registradas. Consultar no envía un mensaje. Si sientes dolor, para y anótalo en la sesión; al terminarla, cuéntalo en el feedback.",
    understood: "Entendido",
    tellInFeedback: "Cuéntale en el feedback",
    viewNotes: "Ver mis notas de esta sesión",
} as const;
