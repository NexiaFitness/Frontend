/**
 * TestResultCard — último resultado por protocolo (glass premium, paridad ExerciseCard).
 */

import React from "react";
import { History, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { Badge } from "@/components/ui/Badge";
import {
    TESTING_BASELINE_BADGE,
    TESTING_BASELINE_CHIP,
    TESTING_CTA_RETEST,
    TESTING_RESULT_BADGE_ROW,
    TESTING_RESULT_CARD,
    TESTING_RESULT_CARD_ACTIONS,
    TESTING_RESULT_CARD_HEADER,
    TESTING_RESULT_CARD_TITLE,
    TESTING_RESULT_ICON_BTN,
    TESTING_RESULT_ICON_BTN_DANGER,
    TESTING_RESULT_META,
    TESTING_RESULT_UNIT,
    TESTING_RESULT_VALUE,
    TESTING_RESULT_VALUE_ROW,
    formatTestingDate,
    testingProgressChipClass,
} from "../clientTestingPresentation";

export interface TestResultCardModel {
    resultId: number;
    testId: number;
    testName: string;
    value: number;
    unit: string;
    testDate: string;
    isBaseline: boolean;
    progressPercentage: number | null;
}

interface TestResultCardProps {
    test: TestResultCardModel;
    onRetest: (testId: number) => void;
    onEdit: (resultId: number) => void;
    onHistory: (testId: number, testName: string) => void;
    onDelete: (resultId: number, testName: string) => void;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({
    test,
    onRetest,
    onEdit,
    onHistory,
    onDelete,
}) => (
    <article
        className={TESTING_RESULT_CARD}
        data-testid={`test-result-card-${test.testId}`}
    >
        <NexiaGlassAccentRim />
        <header className={TESTING_RESULT_CARD_HEADER}>
            <h3 className={TESTING_RESULT_CARD_TITLE}>{test.testName}</h3>
            <div className={TESTING_RESULT_CARD_ACTIONS}>
                <button
                    type="button"
                    className={TESTING_RESULT_ICON_BTN}
                    aria-label="Editar"
                    onClick={() => onEdit(test.resultId)}
                >
                    <Pencil className="size-4" aria-hidden />
                </button>
                <button
                    type="button"
                    className={TESTING_RESULT_ICON_BTN}
                    aria-label="Historial"
                    onClick={() => onHistory(test.testId, test.testName)}
                >
                    <History className="size-4" aria-hidden />
                </button>
                <button
                    type="button"
                    className={TESTING_RESULT_ICON_BTN_DANGER}
                    aria-label="Eliminar"
                    onClick={() => onDelete(test.resultId, test.testName)}
                >
                    <Trash2 className="size-4" aria-hidden />
                </button>
            </div>
        </header>

        <div className={TESTING_RESULT_VALUE_ROW}>
            <span className={TESTING_RESULT_VALUE}>{test.value}</span>
            <span className={TESTING_RESULT_UNIT}>{test.unit}</span>
        </div>

        {(test.isBaseline || test.progressPercentage !== null) && (
            <div className={TESTING_RESULT_BADGE_ROW}>
                {test.isBaseline && (
                    <Badge variant="outline" className={TESTING_BASELINE_CHIP}>
                        {TESTING_BASELINE_BADGE}
                    </Badge>
                )}
                {test.progressPercentage !== null && !test.isBaseline && (
                    <span className={testingProgressChipClass(test.progressPercentage)}>
                        {test.progressPercentage > 0 ? "+" : ""}
                        {test.progressPercentage.toFixed(1)}% vs línea base
                    </span>
                )}
            </div>
        )}

        <p className={TESTING_RESULT_META}>{formatTestingDate(test.testDate)}</p>

        <div className="mt-auto pt-4">
            <Button
                type="button"
                variant="ghost-primary"
                size="sm"
                className="h-8 px-0 text-xs"
                onClick={() => onRetest(test.testId)}
            >
                {TESTING_CTA_RETEST}
            </Button>
        </div>
    </article>
);
