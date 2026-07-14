/**
 * createTestEvaluationPresentation — Copy Spec 01 §5.3
 */

import type { TestCategory } from "@nexia/shared/types/testing";
import { TEST_CATEGORIES } from "@nexia/shared/types/testing";

export const CREATE_EVAL_PAGE_TITLE = "Registrar evaluación";

export const CREATE_EVAL_PAGE_SUBTITLE =
    "Protocolo formal de test físico. Los datos se guardan en la ficha del cliente.";

export const CREATE_EVAL_CLIENT_LABEL = "Cliente";

export const CREATE_EVAL_TEST_LABEL = "Evaluación";

export const CREATE_EVAL_TEST_PLACEHOLDER = "Selecciona una evaluación";

export const CREATE_EVAL_VALUE_LABEL = "Resultado";

export const CREATE_EVAL_DATE_LABEL = "Fecha";

export const CREATE_EVAL_BASELINE_LABEL = "Marcar como línea base";

export const CREATE_EVAL_SURFACE_LABEL = "Superficie (opcional)";

export const CREATE_EVAL_CONDITIONS_LABEL = "Condiciones (opcional)";

export const CREATE_EVAL_NOTES_LABEL = "Notas (opcional)";

export const CREATE_EVAL_SUBMIT = "Guardar evaluación";

export const CREATE_EVAL_CANCEL = "Cancelar";

export const CREATE_EVAL_CREATE_TEST_TOGGLE = "Crear nueva evaluación";

export const CREATE_EVAL_CREATE_TEST_SUBMIT = "Crear y seleccionar";

export const CREATE_EVAL_CUSTOM_NAME = "Nombre";

export const CREATE_EVAL_CUSTOM_UNIT = "Unidad";

export const CREATE_EVAL_CUSTOM_FREQUENCY = "Frecuencia (semanas)";

export const CREATE_EVAL_CUSTOM_DESCRIPTION = "Descripción (opcional)";

export const CREATE_EVAL_SUCCESS = "Evaluación registrada correctamente";

export const CREATE_EVAL_ERROR = "No se pudo registrar la evaluación";

export const CREATE_EVAL_STRENGTH_PR_HINT =
    "Este resultado puede actualizar el PR del ejercicio vinculado.";

export const CREATE_EVAL_MISSING_CLIENT =
    "Falta el cliente en la URL. Abre el registro desde la ficha del cliente.";

export const CREATE_EVAL_MISSING_TRAINER =
    "No se pudo cargar el perfil del entrenador. Recarga e inténtalo de nuevo.";

export const CREATE_EVAL_INVALID_VALUE = "Introduce un resultado numérico válido.";

export const CREATE_EVAL_SELECT_TEST = "Selecciona una evaluación del catálogo.";

export const TEST_CATEGORY_OPTIONS: { value: TestCategory; label: string }[] = (
    Object.entries(TEST_CATEGORIES) as [TestCategory, { label: string }][]
).map(([value, info]) => ({
    value,
    label: info.label,
}));

export const isStrengthRmUnit = (category: TestCategory, unit: string): boolean =>
    category === "strength" && ["kg", "lb", "lbs"].includes(unit.trim().toLowerCase());
