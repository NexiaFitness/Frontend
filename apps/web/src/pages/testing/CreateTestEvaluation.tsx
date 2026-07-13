/**
 * CreateTestEvaluation.tsx — Flujo alta evaluación física (Spec 01 §5.3)
 *
 * Ruta: /dashboard/testing/register-evaluation
 * Query: clientId, category, testId (opcional)
 */

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import {
    TEST_CATEGORIES,
    useCreateTestEvaluation,
    type PhysicalTestOut,
    type TestCategory,
} from "@nexia/shared";
import { useGetClientQuery, useGetPhysicalTestsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { RootState } from "@nexia/shared/store";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import {
    Checkbox,
    DatePickerButton,
    FormSelect,
    Input,
    Textarea,
} from "@/components/ui/forms";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import {
    CREATE_EVAL_CANCEL,
    CREATE_EVAL_CLIENT_LABEL,
    CREATE_EVAL_CONDITIONS_LABEL,
    CREATE_EVAL_CREATE_TEST_SUBMIT,
    CREATE_EVAL_CREATE_TEST_TOGGLE,
    CREATE_EVAL_CUSTOM_DESCRIPTION,
    CREATE_EVAL_CUSTOM_FREQUENCY,
    CREATE_EVAL_CUSTOM_NAME,
    CREATE_EVAL_CUSTOM_UNIT,
    CREATE_EVAL_DATE_LABEL,
    CREATE_EVAL_BASELINE_LABEL,
    CREATE_EVAL_ERROR,
    CREATE_EVAL_INVALID_VALUE,
    CREATE_EVAL_MISSING_CLIENT,
    CREATE_EVAL_MISSING_TRAINER,
    CREATE_EVAL_NOTES_LABEL,
    CREATE_EVAL_PAGE_SUBTITLE,
    CREATE_EVAL_PAGE_TITLE,
    CREATE_EVAL_SELECT_TEST,
    CREATE_EVAL_STRENGTH_PR_HINT,
    CREATE_EVAL_SUBMIT,
    CREATE_EVAL_SUCCESS,
    CREATE_EVAL_SURFACE_LABEL,
    CREATE_EVAL_TEST_LABEL,
    CREATE_EVAL_TEST_PLACEHOLDER,
    CREATE_EVAL_VALUE_LABEL,
    TEST_CATEGORY_OPTIONS,
    isStrengthRmUnit,
} from "./createTestEvaluationPresentation";

const VALID_CATEGORIES = new Set<string>([
    "strength",
    "power",
    "speed",
    "aerobic",
    "anaerobic",
    "mobility",
]);

function parseCategory(value: string | null): TestCategory {
    if (value && VALID_CATEGORIES.has(value)) {
        return value as TestCategory;
    }
    return "mobility";
}

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

export const CreateTestEvaluation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { showSuccess, showError } = useToast();
    const { user } = useSelector((state: RootState) => state.auth);

    const clientIdParam = searchParams.get("clientId");
    const clientId = clientIdParam ? Number.parseInt(clientIdParam, 10) : NaN;
    const categoryParam = parseCategory(searchParams.get("category"));
    const testIdParam = searchParams.get("testId");
    const preselectedTestId = testIdParam ? Number.parseInt(testIdParam, 10) : null;

    const returnPath = useMemo(() => {
        const state = location.state as { from?: string } | null;
        if (state?.from) return state.from;
        if (Number.isFinite(clientId)) {
            return `/dashboard/clients/${clientId}?tab=testing`;
        }
        return "/dashboard";
    }, [clientId, location.state]);

    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId, {
        skip: !Number.isFinite(clientId),
    });

    const { data: trainerProfile, isLoading: isLoadingTrainer } =
        useGetCurrentTrainerProfileQuery(undefined, {
            skip: !user || user.role !== "trainer",
        });
    const trainerId = trainerProfile?.id ?? 0;

    const [filterCategory, setFilterCategory] = useState<TestCategory>(categoryParam);
    const { data: tests = [], isLoading: isLoadingTests, refetch: refetchTests } =
        useGetPhysicalTestsQuery({ category: filterCategory });

    const { registerEvaluation, createCustomTest, isSubmitting } =
        useCreateTestEvaluation();

    const [selectedTestId, setSelectedTestId] = useState<number | "">("");
    const [value, setValue] = useState("");
    const [unit, setUnit] = useState("");
    const [testDate, setTestDate] = useState(todayIsoDate());
    const [isBaseline, setIsBaseline] = useState(false);
    const [surface, setSurface] = useState("");
    const [conditions, setConditions] = useState("");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customUnit, setCustomUnit] = useState("");
    const [customFrequency, setCustomFrequency] = useState("");
    const [customDescription, setCustomDescription] = useState("");
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);

    useEffect(() => {
        setFilterCategory(categoryParam);
    }, [categoryParam]);

    useEffect(() => {
        if (preselectedTestId != null && Number.isFinite(preselectedTestId)) {
            setSelectedTestId(preselectedTestId);
        }
    }, [preselectedTestId]);

    const selectedTest: PhysicalTestOut | undefined = useMemo(() => {
        if (selectedTestId === "") return undefined;
        return tests.find((test) => test.id === selectedTestId);
    }, [selectedTestId, tests]);

    useEffect(() => {
        if (selectedTest?.unit) {
            setUnit(selectedTest.unit);
        }
    }, [selectedTest?.id, selectedTest?.unit]);

    const testOptions = useMemo(
        () =>
            tests.map((test) => ({
                value: String(test.id),
                label: test.is_standard ? test.name : `${test.name} (custom)`,
            })),
        [tests],
    );

    const showStrengthPrHint =
        selectedTest != null &&
        isStrengthRmUnit(selectedTest.category as TestCategory, unit) &&
        (selectedTest.primary_exercise_id != null ||
            selectedTest.linked_exercise_id != null);

    const handleCreateCustomTest = async () => {
        setFormError(null);
        const name = customName.trim();
        const customUnitValue = customUnit.trim();
        if (!name || !customUnitValue) {
            setFormError("Nombre y unidad son obligatorios para crear una evaluación.");
            return;
        }

        const frequency = customFrequency.trim()
            ? Number.parseInt(customFrequency, 10)
            : null;
        if (customFrequency.trim() && (!Number.isFinite(frequency) || frequency! <= 0)) {
            setFormError("La frecuencia debe ser un número entero positivo.");
            return;
        }

        setIsCreatingCustom(true);
        try {
            const created = await createCustomTest({
                name,
                category: filterCategory,
                unit: customUnitValue,
                description: customDescription.trim() || null,
                default_frequency_weeks: frequency,
            });
            await refetchTests();
            setSelectedTestId(created.id);
            setUnit(created.unit);
            setShowCustomForm(false);
            setCustomName("");
            setCustomUnit("");
            setCustomFrequency("");
            setCustomDescription("");
        } catch {
            showError(CREATE_EVAL_ERROR);
        } finally {
            setIsCreatingCustom(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (!Number.isFinite(clientId)) {
            setFormError(CREATE_EVAL_MISSING_CLIENT);
            return;
        }
        if (!trainerId) {
            setFormError(CREATE_EVAL_MISSING_TRAINER);
            return;
        }
        if (selectedTestId === "") {
            setFormError(CREATE_EVAL_SELECT_TEST);
            return;
        }

        const numericValue = Number.parseFloat(value.replace(",", "."));
        if (!Number.isFinite(numericValue)) {
            setFormError(CREATE_EVAL_INVALID_VALUE);
            return;
        }

        const resolvedUnit = unit.trim() || selectedTest?.unit || "";
        if (!resolvedUnit) {
            setFormError("Indica la unidad del resultado.");
            return;
        }

        try {
            await registerEvaluation({
                client_id: clientId,
                trainer_id: trainerId,
                test_id: selectedTestId,
                test_date: testDate,
                value: numericValue,
                unit: resolvedUnit,
                is_baseline: isBaseline,
                notes: notes.trim() || null,
                surface: surface.trim() || null,
                conditions: conditions.trim() || null,
            });
            showSuccess(CREATE_EVAL_SUCCESS);
            navigate(returnPath);
        } catch {
            showError(CREATE_EVAL_ERROR);
        }
    };

    if (!Number.isFinite(clientId)) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 p-6">
                <Alert variant="error">{CREATE_EVAL_MISSING_CLIENT}</Alert>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Volver al panel
                </Button>
            </div>
        );
    }

    const isPageLoading = isLoadingClient || isLoadingTrainer || isLoadingTests;

    return (
        <div className="mx-auto max-w-2xl pb-28">
            <div className="mb-6 flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(returnPath)}
                    aria-label="Volver"
                >
                    <ArrowLeft className="size-4" aria-hidden />
                </Button>
                <PageTitle
                    title={CREATE_EVAL_PAGE_TITLE}
                    subtitle={CREATE_EVAL_PAGE_SUBTITLE}
                />
            </div>

            {isPageLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && <Alert variant="error">{formError}</Alert>}

                    <Input
                        label={CREATE_EVAL_CLIENT_LABEL}
                        value={
                            client
                                ? `${client.nombre} ${client.apellidos ?? ""}`.trim()
                                : `Cliente #${clientId}`
                        }
                        readOnly
                        disabled
                    />

                    <FormSelect
                        label="Categoría"
                        value={filterCategory}
                        options={TEST_CATEGORY_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label,
                        }))}
                        onChange={(event) => {
                            const next = event.target.value as TestCategory;
                            setFilterCategory(next);
                            setSelectedTestId("");
                        }}
                    />

                    <FormSelect
                        label={CREATE_EVAL_TEST_LABEL}
                        value={selectedTestId === "" ? "" : String(selectedTestId)}
                        placeholder={CREATE_EVAL_TEST_PLACEHOLDER}
                        options={testOptions}
                        onChange={(event) => {
                            const next = event.target.value;
                            setSelectedTestId(next ? Number.parseInt(next, 10) : "");
                        }}
                        helperText={
                            tests.length === 0
                                ? "No hay evaluaciones en esta categoría. Crea una nueva abajo."
                                : undefined
                        }
                    />

                    <div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 text-primary"
                            onClick={() => setShowCustomForm((prev) => !prev)}
                        >
                            {CREATE_EVAL_CREATE_TEST_TOGGLE}
                        </Button>
                    </div>

                    {showCustomForm && (
                        <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                            <Input
                                label={CREATE_EVAL_CUSTOM_NAME}
                                value={customName}
                                onChange={(event) => setCustomName(event.target.value)}
                                isRequired
                            />
                            <Input
                                label={CREATE_EVAL_CUSTOM_UNIT}
                                value={customUnit}
                                onChange={(event) => setCustomUnit(event.target.value)}
                                placeholder="kg, s, cm, ml/kg/min…"
                                isRequired
                            />
                            <Input
                                label={CREATE_EVAL_CUSTOM_FREQUENCY}
                                type="number"
                                min={1}
                                value={customFrequency}
                                onChange={(event) => setCustomFrequency(event.target.value)}
                            />
                            <Textarea
                                label={CREATE_EVAL_CUSTOM_DESCRIPTION}
                                value={customDescription}
                                onChange={(event) => setCustomDescription(event.target.value)}
                                rows={2}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isCreatingCustom}
                                onClick={() => void handleCreateCustomTest()}
                            >
                                {isCreatingCustom
                                    ? "Creando…"
                                    : CREATE_EVAL_CREATE_TEST_SUBMIT}
                            </Button>
                        </section>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label={CREATE_EVAL_VALUE_LABEL}
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            isRequired
                        />
                        <Input
                            label="Unidad"
                            value={unit}
                            onChange={(event) => setUnit(event.target.value)}
                            placeholder={selectedTest?.unit ?? ""}
                            isRequired
                        />
                    </div>

                    <DatePickerButton
                        label={CREATE_EVAL_DATE_LABEL}
                        value={testDate}
                        onChange={setTestDate}
                    />

                    <Checkbox
                        label={CREATE_EVAL_BASELINE_LABEL}
                        checked={isBaseline}
                        onChange={(event) => setIsBaseline(event.target.checked)}
                    />

                    <Input
                        label={CREATE_EVAL_SURFACE_LABEL}
                        value={surface}
                        onChange={(event) => setSurface(event.target.value)}
                    />

                    <Input
                        label={CREATE_EVAL_CONDITIONS_LABEL}
                        value={conditions}
                        onChange={(event) => setConditions(event.target.value)}
                    />

                    <Textarea
                        label={CREATE_EVAL_NOTES_LABEL}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={3}
                    />

                    {showStrengthPrHint && (
                        <Alert variant="info">{CREATE_EVAL_STRENGTH_PR_HINT}</Alert>
                    )}

                    {selectedTest && (
                        <p className="text-xs text-muted-foreground">
                            Categoría: {TEST_CATEGORIES[selectedTest.category as TestCategory]?.label ?? selectedTest.category}
                        </p>
                    )}

                    <DashboardFixedFooter>
                        <div className="flex w-full max-w-2xl justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(returnPath)}
                            >
                                {CREATE_EVAL_CANCEL}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || !trainerId}
                            >
                                {isSubmitting ? "Guardando…" : CREATE_EVAL_SUBMIT}
                            </Button>
                        </div>
                    </DashboardFixedFooter>
                </form>
            )}
        </div>
    );
};
