/**
 * EditTestResultModal — corregir un registro de evaluación existente.
 */

import React, { useEffect, useState } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import {
    Checkbox,
    DatePickerButton,
    FormCombobox,
    Input,
    Label,
    Textarea,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import { getMutationErrorMessage } from "@nexia/shared";
import { useUpdateTestResultMutation } from "@nexia/shared/api/clientsApi";
import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";
import {
    CREATE_EVAL_BASELINE_LABEL,
    CREATE_EVAL_CONDITIONS_LABEL,
    CREATE_EVAL_INVALID_VALUE,
    CREATE_EVAL_INVALID_TIME,
    CREATE_EVAL_NOTES_LABEL,
    CREATE_EVAL_SURFACE_LABEL,
    CREATE_EVAL_UNIT_LABEL,
    CREATE_EVAL_VALUE_LABEL,
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
        <BaseModal
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
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                {formError && <Alert variant="error">{formError}</Alert>}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label={CREATE_EVAL_VALUE_LABEL}
                        type="text"
                        inputMode={isTimeUnit(unit) ? "text" : "decimal"}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={isTimeUnit(unit) ? "1:25" : undefined}
                        helperText={isTimeUnit(unit) ? CREATE_EVAL_VALUE_TIME_HINT : undefined}
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
                            onChange={setUnit}
                            ariaLabel={CREATE_EVAL_UNIT_LABEL}
                        />
                    </div>
                </div>

                <DatePickerButton label="Fecha" value={testDate} onChange={setTestDate} />

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
                    rows={2}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading || !result}>
                        {isLoading ? "Guardando…" : "Guardar cambios"}
                    </Button>
                </div>
            </form>
            )}
        </BaseModal>
    );
};
