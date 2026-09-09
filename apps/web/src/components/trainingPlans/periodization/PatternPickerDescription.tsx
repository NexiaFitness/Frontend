/**
 * PatternPickerDescription.tsx — Subtítulo + atajo copiar patrones (wizard D-PAP).
 */

import React from "react";

import {
    BLOCK_PATTERN_PICKER_COPY_DAY_BTN_CLASS,
    BLOCK_PATTERN_PICKER_COPY_LABEL_CLASS,
    BLOCK_PATTERN_PICKER_COPY_ROW_CLASS,
    BLOCK_PATTERN_PICKER_COPY_SEPARATOR_CLASS,
    BLOCK_PATTERN_PICKER_DESCRIPTION_ROW_CLASS,
    BLOCK_PATTERN_PICKER_INSTRUCTION_CLASS,
} from "./blockPatternPickerPresentation";

export interface PatternPickerCopySource {
    dayOfWeek: number;
    dayLabel: string;
}

interface Props {
    copySources: readonly PatternPickerCopySource[];
    onCopyFromDay: (fromDayOfWeek: number) => void;
    showCopyShortcut: boolean;
}

export const PatternPickerDescription: React.FC<Props> = ({
    copySources,
    onCopyFromDay,
    showCopyShortcut,
}) => (
    <div className={BLOCK_PATTERN_PICKER_DESCRIPTION_ROW_CLASS}>
        <p className={BLOCK_PATTERN_PICKER_INSTRUCTION_CLASS}>
            Pulsa los patrones que quieras para este día.
        </p>
        {showCopyShortcut && copySources.length > 0 ? (
            <div
                className={BLOCK_PATTERN_PICKER_COPY_ROW_CLASS}
                data-testid="pattern-picker-copy-sources"
            >
                <span className={BLOCK_PATTERN_PICKER_COPY_LABEL_CLASS}>
                    Copiar de:
                </span>
                {copySources.map((source, index) => (
                    <React.Fragment key={source.dayOfWeek}>
                        {index > 0 ? (
                            <span
                                className={BLOCK_PATTERN_PICKER_COPY_SEPARATOR_CLASS}
                                aria-hidden
                            >
                                {" · "}
                            </span>
                        ) : null}
                        <button
                            type="button"
                            className={BLOCK_PATTERN_PICKER_COPY_DAY_BTN_CLASS}
                            onClick={() => onCopyFromDay(source.dayOfWeek)}
                            data-testid={`pattern-picker-copy-from-${source.dayOfWeek}`}
                        >
                            {source.dayLabel}
                        </button>
                    </React.Fragment>
                ))}
            </div>
        ) : null}
    </div>
);
