/**
 * useCreateTestEvaluation — flujo alta evaluación + definición inline (Spec 01 F1).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetPhysicalTestsQuery } from "../../api/clientsApi";
import { useCreatePhysicalTest } from "./useCreatePhysicalTest";
import { useCreateTestResult } from "./useCreateTestResult";
import type {
    PhysicalTestCreate,
    PhysicalTestOut,
    TestCategory,
} from "../../types/testing";

export interface TestEvaluationFormState {
    test_id: string;
    test_date: string;
    value: string;
    unit: string;
    is_baseline: boolean;
    notes: string;
    surface: string;
    conditions: string;
}

export interface TestDefinitionFormState {
    name: string;
    category: TestCategory;
    unit: string;
    default_frequency_weeks: string;
    description: string;
}

const DEFAULT_RESULT_FORM = (): TestEvaluationFormState => ({
    test_id: "",
    test_date: new Date().toISOString().split("T")[0],
    value: "",
    unit: "",
    is_baseline: false,
    notes: "",
    surface: "",
    conditions: "",
});

const DEFAULT_DEFINITION_FORM = (
    category: TestCategory,
): TestDefinitionFormState => ({
    name: "",
    category,
    unit: "",
    default_frequency_weeks: "12",
    description: "",
});

export interface UseCreateTestEvaluationOptions {
    clientId: number;
    trainerId: number;
    category: TestCategory;
    preselectTestId?: number | null;
}

export function useCreateTestEvaluation({
    clientId,
    trainerId,
    category,
    preselectTestId,
}: UseCreateTestEvaluationOptions) {
    const [formData, setFormData] = useState<TestEvaluationFormState>(DEFAULT_RESULT_FORM);
    const [definitionForm, setDefinitionForm] = useState<TestDefinitionFormState>(
        DEFAULT_DEFINITION_FORM(category),
    );
    const [showDefinitionForm, setShowDefinitionForm] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [definitionErrors, setDefinitionErrors] = useState<Record<string, string>>({});

    const {
        data: availableTests = [],
        isLoading: isLoadingTests,
        refetch: refetchTests,
    } = useGetPhysicalTestsQuery({ category }, { skip: !clientId });

    const { createPhysicalTest, isLoading: isCreatingDefinition } =
        useCreatePhysicalTest();
    const { createTestResult, isSubmitting: isSubmittingResult } =
        useCreateTestResult();

    useEffect(() => {
        setDefinitionForm(DEFAULT_DEFINITION_FORM(category));
        setShowDefinitionForm(false);
    }, [category]);

    useEffect(() => {
        if (!preselectTestId) return;
        setFormData((prev) => ({
            ...prev,
            test_id: String(preselectTestId),
        }));
    }, [preselectTestId]);

    const selectedTest = useMemo((): PhysicalTestOut | null => {
        if (!formData.test_id) return null;
        return (
            availableTests.find((t) => t.id === parseInt(formData.test_id, 10)) ?? null
        );
    }, [formData.test_id, availableTests]);

    useEffect(() => {
        if (selectedTest?.unit) {
            setFormData((prev) => ({ ...prev, unit: selectedTest.unit }));
        }
    }, [selectedTest]);

    const updateField = useCallback(
        <K extends keyof TestEvaluationFormState>(
            field: K,
            value: TestEvaluationFormState[K],
        ) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setFormErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        [],
    );

    const updateDefinitionField = useCallback(
        <K extends keyof TestDefinitionFormState>(
            field: K,
            value: TestDefinitionFormState[K],
        ) => {
            setDefinitionForm((prev) => ({ ...prev, [field]: value }));
            setDefinitionErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        [],
    );

    const validateResult = useCallback((): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.test_id) errors.test_id = "Selecciona una evaluación.";
        if (!formData.test_date) errors.test_date = "La fecha es obligatoria.";
        if (!formData.value || Number.isNaN(parseFloat(formData.value))) {
            errors.value = "Indica un valor numérico válido.";
        }
        if (!formData.unit.trim()) errors.unit = "La unidad es obligatoria.";
        if (!trainerId) errors.trainer = "No se pudo obtener el entrenador.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, trainerId]);

    const validateDefinition = useCallback((): boolean => {
        const errors: Record<string, string> = {};
        if (!definitionForm.name.trim()) errors.name = "El nombre es obligatorio.";
        if (!definitionForm.unit.trim()) errors.unit = "La unidad es obligatoria.";
        const weeks = Number(definitionForm.default_frequency_weeks);
        if (
            definitionForm.default_frequency_weeks.trim() &&
            (Number.isNaN(weeks) || weeks <= 0)
        ) {
            errors.default_frequency_weeks = "Frecuencia inválida.";
        }
        setDefinitionErrors(errors);
        return Object.keys(errors).length === 0;
    }, [definitionForm]);

    const submitDefinition = useCallback(async (): Promise<boolean> => {
        if (!validateDefinition()) return false;
        const weeks = definitionForm.default_frequency_weeks.trim()
            ? Number(definitionForm.default_frequency_weeks)
            : null;
        const payload: PhysicalTestCreate = {
            name: definitionForm.name.trim(),
            category: definitionForm.category,
            unit: definitionForm.unit.trim(),
            is_standard: false,
            default_frequency_weeks: weeks,
            description: definitionForm.description.trim() || null,
        };
        const created = await createPhysicalTest(payload);
        await refetchTests();
        setFormData((prev) => ({
            ...prev,
            test_id: String(created.id),
            unit: created.unit,
        }));
        setShowDefinitionForm(false);
        setDefinitionForm(DEFAULT_DEFINITION_FORM(category));
        return true;
    }, [
        category,
        createPhysicalTest,
        definitionForm,
        refetchTests,
        validateDefinition,
    ]);

    const submitResult = useCallback(async (): Promise<boolean> => {
        if (!validateResult()) return false;
        await createTestResult({
            client_id: clientId,
            test_id: parseInt(formData.test_id, 10),
            trainer_id: trainerId,
            test_date: formData.test_date,
            value: parseFloat(formData.value),
            unit: formData.unit,
            is_baseline: formData.is_baseline,
            notes: formData.notes.trim() || null,
            surface: formData.surface.trim() || null,
            conditions: formData.conditions.trim() || null,
        });
        return true;
    }, [clientId, createTestResult, formData, trainerId, validateResult]);

    const showsStrengthPrHint = useMemo(() => {
        if (!selectedTest || selectedTest.category !== "strength") return false;
        const unit = (selectedTest.unit || formData.unit || "").toLowerCase();
        if (!["kg", "lb"].includes(unit)) return false;
        return (
            selectedTest.primary_exercise_id != null ||
            selectedTest.linked_exercise_id != null
        );
    }, [formData.unit, selectedTest]);

    return {
        formData,
        definitionForm,
        showDefinitionForm,
        setShowDefinitionForm,
        formErrors,
        definitionErrors,
        availableTests,
        selectedTest,
        isLoadingTests,
        isCreatingDefinition,
        isSubmitting: isSubmittingResult || isCreatingDefinition,
        updateField,
        updateDefinitionField,
        submitDefinition,
        submitResult,
        showsStrengthPrHint,
    };
}
