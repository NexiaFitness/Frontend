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
    FormCombobox,
    Input,
    Label,
    Textarea,
} from "@/components/ui/forms";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    CREATE_EVAL_BACK_BUTTON,
    CREATE_EVAL_BACK_LABEL,
    CREATE_EVAL_CATEGORY_LABEL,
    CREATE_EVAL_CREATE_TOGGLE,
    CREATE_EVAL_CUSTOM_PANEL,
    CREATE_EVAL_EMPTY_HINT,
    CREATE_EVAL_FOOTER_ACTIONS,
    CREATE_EVAL_FOOTER_BTN,
    CREATE_EVAL_FORM_BODY,
    CREATE_EVAL_FORM_CARD,
    CREATE_EVAL_GLOW,
    CREATE_EVAL_HEADER,
    CREATE_EVAL_ICON_BACK_GAP,
    CREATE_EVAL_ICON_SM,
    CREATE_EVAL_LOADING_ROW,
    CREATE_EVAL_PAGE,
    CREATE_EVAL_TITLE_WRAP,
    CREATE_EVAL_VALUE_GRID,
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
    CREATE_EVAL_INVALID_TIME,
    CREATE_EVAL_MISSING_CLIENT,
    CREATE_EVAL_MISSING_TRAINER,
    CREATE_EVAL_NOTES_LABEL,
    CREATE_EVAL_PAGE_SUBTITLE,
    CREATE_EVAL_PAGE_SUBTITLE_RETEST,
    CREATE_EVAL_PAGE_TITLE,
    CREATE_EVAL_SELECT_TEST,
    CREATE_EVAL_STRENGTH_PR_HINT,
    CREATE_EVAL_SUBMIT,
    CREATE_EVAL_SUCCESS,
    CREATE_EVAL_SURFACE_LABEL,
    CREATE_EVAL_TEST_LABEL,
    CREATE_EVAL_TEST_PLACEHOLDER,
    CREATE_EVAL_UNIT_LABEL,
    CREATE_EVAL_VALUE_LABEL,
    CREATE_EVAL_VALUE_TIME_HINT,
    TEST_CATEGORY_OPTIONS,
    isStrengthRmUnit,
    isTimeUnit,
    parseEvaluationValue,
    unitSelectOptions,
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

    const { registerEvaluation, createCustomTest, isRegistering, isCreatingTest } =
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

        const parsed = parseEvaluationValue(value, unit.trim() || selectedTest?.unit || "");
        if (!parsed.ok) {
            setFormError(
                parsed.timeExpected ? CREATE_EVAL_INVALID_TIME : CREATE_EVAL_INVALID_VALUE,
            );
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
                value: parsed.value,
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
            <div className={cn(CREATE_EVAL_PAGE, "space-y-4")}>
                <Alert variant="error">{CREATE_EVAL_MISSING_CLIENT}</Alert>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Volver al panel
                </Button>
            </div>
        );
    }

    const isPageLoading = isLoadingClient || isLoadingTrainer || isLoadingTests;
    const pageSubtitle =
        preselectedTestId != null && Number.isFinite(preselectedTestId)
            ? CREATE_EVAL_PAGE_SUBTITLE_RETEST
            : CREATE_EVAL_PAGE_SUBTITLE;

    return (
        <div className={CREATE_EVAL_PAGE}>
            <div className={CREATE_EVAL_GLOW} aria-hidden />

            <div className={CREATE_EVAL_HEADER}>
                <PageTitle
                    title={CREATE_EVAL_PAGE_TITLE}
                    subtitle={pageSubtitle}
                    className={CREATE_EVAL_TITLE_WRAP}
                />
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={CREATE_EVAL_BACK_BUTTON}
                    onClick={() => navigate(returnPath)}
                >
                    <ArrowLeft
                        className={cn(CREATE_EVAL_ICON_BACK_GAP, CREATE_EVAL_ICON_SM)}
                        aria-hidden
                    />
                    {CREATE_EVAL_BACK_LABEL}
                </Button>
            </div>

            {isPageLoading ? (
                <div className={CREATE_EVAL_LOADING_ROW}>
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className={CREATE_EVAL_FORM_CARD}>
                        <NexiaGlassAccentRim />
                        <div className={CREATE_EVAL_FORM_BODY}>
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

                    <div className="space-y-1.5">
                        <Label className="text-foreground">{CREATE_EVAL_CATEGORY_LABEL}</Label>
                        <FormCombobox
                            size="sm"
                            value={filterCategory}
                            options={TEST_CATEGORY_OPTIONS.map((option) => ({
                                value: option.value,
                                label: option.label,
                            }))}
                            onChange={(next) => {
                                setFilterCategory(next as TestCategory);
                                setSelectedTestId("");
                            }}
                            ariaLabel={CREATE_EVAL_CATEGORY_LABEL}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-foreground">{CREATE_EVAL_TEST_LABEL}</Label>
                        <FormCombobox
                            size="sm"
                            value={selectedTestId === "" ? "" : String(selectedTestId)}
                            placeholder={CREATE_EVAL_TEST_PLACEHOLDER}
                            options={testOptions}
                            onChange={(next) => {
                                setSelectedTestId(next ? Number.parseInt(next, 10) : "");
                            }}
                            ariaLabel={CREATE_EVAL_TEST_LABEL}
                        />
                        {tests.length === 0 && (
                            <p className={CREATE_EVAL_EMPTY_HINT}>
                                No hay evaluaciones en esta categoría. Crea una nueva abajo.
                            </p>
                        )}
                    </div>

                    <div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={CREATE_EVAL_CREATE_TOGGLE}
                            onClick={() => setShowCustomForm((prev) => !prev)}
                        >
                            {CREATE_EVAL_CREATE_TEST_TOGGLE}
                        </Button>
                    </div>

                    {showCustomForm && (
                        <section className={CREATE_EVAL_CUSTOM_PANEL}>
                            <NexiaGlassAccentRim />
                            <Input
                                label={CREATE_EVAL_CUSTOM_NAME}
                                value={customName}
                                onChange={(event) => setCustomName(event.target.value)}
                                isRequired
                            />
                            <div className="space-y-1.5">
                                <Label className="text-foreground">
                                    {CREATE_EVAL_CUSTOM_UNIT}{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <FormCombobox
                                    size="sm"
                                    value={customUnit}
                                    options={unitSelectOptions(customUnit)}
                                    placeholder="Selecciona unidad"
                                    onChange={setCustomUnit}
                                    ariaLabel={CREATE_EVAL_CUSTOM_UNIT}
                                />
                            </div>
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
                                disabled={isCreatingCustom || isCreatingTest}
                                onClick={() => void handleCreateCustomTest()}
                            >
                                {isCreatingCustom || isCreatingTest
                                    ? "Creando…"
                                    : CREATE_EVAL_CREATE_TEST_SUBMIT}
                            </Button>
                        </section>
                    )}

                    <div className={CREATE_EVAL_VALUE_GRID}>
                        <Input
                            label={CREATE_EVAL_VALUE_LABEL}
                            type="text"
                            inputMode={isTimeUnit(unit) ? "text" : "decimal"}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder={isTimeUnit(unit) ? "1:25" : undefined}
                            helperText={
                                isTimeUnit(unit) ? CREATE_EVAL_VALUE_TIME_HINT : undefined
                            }
                            isRequired
                        />
                        <div className="space-y-1.5">
                            <Label className="text-foreground">
                                {CREATE_EVAL_UNIT_LABEL}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <FormCombobox
                                size="sm"
                                value={unit}
                                options={unitSelectOptions(unit)}
                                placeholder="Selecciona unidad"
                                onChange={setUnit}
                                ariaLabel={CREATE_EVAL_UNIT_LABEL}
                            />
                        </div>
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
                        <p className={CREATE_EVAL_EMPTY_HINT}>
                            Categoría: {TEST_CATEGORIES[selectedTest.category as TestCategory]?.label ?? selectedTest.category}
                        </p>
                    )}
                        </div>
                    </div>

                    <DashboardFixedFooter>
                        <div className={CREATE_EVAL_FOOTER_ACTIONS}>
                            <Button
                                type="button"
                                variant="outline"
                                className={CREATE_EVAL_FOOTER_BTN}
                                onClick={() => navigate(returnPath)}
                            >
                                {CREATE_EVAL_CANCEL}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className={CREATE_EVAL_FOOTER_BTN}
                                disabled={isRegistering || isCreatingTest || !trainerId}
                            >
                                {isRegistering ? "Guardando…" : CREATE_EVAL_SUBMIT}
                            </Button>
                        </div>
                    </DashboardFixedFooter>
                </form>
            )}
        </div>
    );
};
