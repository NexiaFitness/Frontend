/**
 * EditTestResultModal — corregir un registro de evaluación existente.
 */

import React, { useEffect, useState } from "react";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    Checkbox,
    DatePickerButton,
    FormCombobox,
    FormField,
    Input,
    Textarea,
} from "@/components/ui/forms";
import { PLATFORM_FORM_SECTION } from "@/components/ui/forms/platformFormPresentation";
import { PLATFORM_SPEC_GRID } from "@/components/ui/surface/platformPremiumPresentation";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { getMutationErrorMessage } from "@nexia/shared";
import { useUpdateTestResultMutation } from "@nexia/shared/api/clientsApi";
import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";
import {
    CREATE_EVAL_BASELINE_LABEL,
    CREATE_EVAL_CONDITIONS_LABEL,
    CREATE_EVAL_CONDITIONS_PLACEHOLDER,
    CREATE_EVAL_INVALID_VALUE,
    CREATE_EVAL_INVALID_TIME,
    CREATE_EVAL_NOTES_LABEL,
    CREATE_EVAL_NOTES_PLACEHOLDER,
    CREATE_EVAL_SURFACE_LABEL,
    CREATE_EVAL_SURFACE_PLACEHOLDER,
    CREATE_EVAL_SUBMIT_CTA,
    CREATE_EVAL_UNIT_LABEL,
    CREATE_EVAL_UNIT_PLACEHOLDER,
    CREATE_EVAL_VALUE_LABEL,
    CREATE_EVAL_VALUE_PLACEHOLDER,
    CREATE_EVAL_VALUE_PLACEHOLDER_TIME,
    CREATE_EVAL_VALUE_TIME_HINT,
    isTimeUnit,
    parseEvaluationValue,
    unitSelectOptions,
} from "@/pages/testing/createTestEvaluationPresentation";
import {
    TESTING_EDIT_MODAL_TITLE,
    TESTING_EDIT_SUCCESS,
    formatSecondsForTimeInput,
} from "../clientTestingPresentation";

const FORM_VARIANT = "premium" as const;

interface EditTestResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: PhysicalTestResultOut | null;
    testName: string;
}

export const EditTestResultModal: React.FC<EditTestResultModalProps> = ({
    isOpen,
    onClose,
    result,
    testName,
}) => {
    const { showSuccess, showError } = useToast();
    const [updateResult, { isLoading }] = useUpdateTestResultMutation();

    const [value, setValue] = useState("");
    const [unit, setUnit] = useState("kg");
    const [testDate, setTestDate] = useState("");
    const [isBaseline, setIsBaseline] = useState(false);
    const [surface, setSurface] = useState("");
    const [conditions, setConditions] = useState("");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!result || !isOpen) return;
        setUnit(result.unit);
        setValue(
            isTimeUnit(result.unit)
                ? formatSecondsForTimeInput(result.value)
                : String(result.value),
        );
        setTestDate(result.test_date.slice(0, 10));
        setIsBaseline(result.is_baseline);
        setSurface(result.surface ?? "");
        setConditions(result.conditions ?? "");
        setNotes(result.notes ?? "");
        setFormError(null);
    }, [result, isOpen]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!result) return;

        const parsed = parseEvaluationValue(value, unit);
        if (!parsed.ok) {
            setFormError(parsed.timeExpected ? CREATE_EVAL_INVALID_TIME : CREATE_EVAL_INVALID_VALUE);
            return;
        }

        try {
            await updateResult({
                resultId: result.id,
                data: {
                    value: parsed.value,
                    unit,
                    test_date: testDate,
                    is_baseline: isBaseline,
                    surface: surface.trim() || null,
                    conditions: conditions.trim() || null,
                    notes: notes.trim() || null,
                },
            }).unwrap();
            showSuccess(TESTING_EDIT_SUCCESS);
            onClose();
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={TESTING_EDIT_MODAL_TITLE}
            description={testName}
            maxWidth="lg"
            isLoading={isOpen && result == null}
        >
            {!result ? (
                <div className="flex min-h-[8rem] items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className={cn(PLATFORM_FORM_SECTION, "pb-2")}>
                {formError && <Alert variant="error">{formError}</Alert>}

                <div className={cn(PLATFORM_SPEC_GRID, "gap-4")}>
                    <FormField label={CREATE_EVAL_VALUE_LABEL} required variant={FORM_VARIANT}>
                        <Input
                            variant={FORM_VARIANT}
                            type="text"
                            inputMode={isTimeUnit(unit) ? "text" : "decimal"}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder={
                                isTimeUnit(unit)
                                    ? CREATE_EVAL_VALUE_PLACEHOLDER_TIME
                                    : CREATE_EVAL_VALUE_PLACEHOLDER
                            }
                            helperText={isTimeUnit(unit) ? CREATE_EVAL_VALUE_TIME_HINT : undefined}
                        />
                    </FormField>
                    <FormField label={CREATE_EVAL_UNIT_LABEL} required variant={FORM_VARIANT}>
                        <FormCombobox
                            size="sm"
                            variant={FORM_VARIANT}
                            value={unit}
                            options={unitSelectOptions(unit)}
                            placeholder={CREATE_EVAL_UNIT_PLACEHOLDER}
                            onChange={setUnit}
                            ariaLabel={CREATE_EVAL_UNIT_LABEL}
                        />
                    </FormField>
                </div>

                <FormField label="Fecha" variant={FORM_VARIANT}>
                    <DatePickerButton
                        label="Elegir fecha del test"
                        variant="form"
                        controlVariant={FORM_VARIANT}
                        value={testDate}
                        onChange={setTestDate}
                    />
                </FormField>

                <Checkbox
                    label={CREATE_EVAL_BASELINE_LABEL}
                    checked={isBaseline}
                    onChange={(event) => setIsBaseline(event.target.checked)}
                />

                <FormField label={CREATE_EVAL_SURFACE_LABEL} variant={FORM_VARIANT}>
                    <Input
                        variant={FORM_VARIANT}
                        value={surface}
                        onChange={(event) => setSurface(event.target.value)}
                        placeholder={CREATE_EVAL_SURFACE_PLACEHOLDER}
                    />
                </FormField>

                <FormField label={CREATE_EVAL_CONDITIONS_LABEL} variant={FORM_VARIANT}>
                    <Input
                        variant={FORM_VARIANT}
                        value={conditions}
                        onChange={(event) => setConditions(event.target.value)}
                        placeholder={CREATE_EVAL_CONDITIONS_PLACEHOLDER}
                    />
                </FormField>

                <Textarea
                    variant={FORM_VARIANT}
                    label={CREATE_EVAL_NOTES_LABEL}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={CREATE_EVAL_NOTES_PLACEHOLDER}
                    rows={2}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline-primary" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className={CREATE_EVAL_SUBMIT_CTA}
                        disabled={isLoading || !result}
                    >
                        {isLoading ? "Guardando…" : "Guardar cambios"}
                    </Button>
                </div>
            </form>
            )}
        </NexiaPremiumModal>
    );
};
