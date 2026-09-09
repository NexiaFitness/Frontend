/**
 * BlockPatternPickerSheet.tsx — Picker focal de patrones por día (wizard D-PAP).
 *
 * Shell: NexiaPremiumModal (referencia canónica del patrón modal premium).
 */

import React, { useMemo } from "react";

import type { MovementPattern } from "@nexia/shared/types/exercise";

import { Button } from "@/components/ui/buttons";
import {
    NexiaPremiumModal,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
} from "@/components/ui/modals";
import { cn } from "@/lib/utils";

import {
    BLOCK_PATTERN_PICKER_COUNT_ACTIVE_CLASS,
    BLOCK_PATTERN_PICKER_COUNT_EMPTY_CLASS,
    BLOCK_PATTERN_PICKER_COUNT_NUMBER_CLASS,
    BLOCK_PATTERN_PICKER_DAY_ACCENT_CLASS,
    BLOCK_PATTERN_PICKER_FOOTER_ROW_CLASS,
} from "./blockPatternPickerPresentation";
import {
    PatternPickerDescription,
    type PatternPickerCopySource,
} from "./PatternPickerDescription";
import { PatternSelectorFlatPanel } from "./PatternSelectorFlatPanel";

interface Props {
    open: boolean;
    onClose: () => void;
    dayLabel: string;
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: readonly number[];
    onToggle: (patternId: number) => void;
    copySources?: readonly PatternPickerCopySource[];
    onCopyFromDay?: (fromDayOfWeek: number) => void;
}

export const BlockPatternPickerSheet: React.FC<Props> = ({
    open,
    onClose,
    dayLabel,
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
    copySources = [],
    onCopyFromDay,
}) => {
    const selectedCount = selectedPatternIds.length;
    const showCopyShortcut =
        selectedCount === 0 && copySources.length > 0 && onCopyFromDay != null;

    const countNode = useMemo(() => {
        if (selectedCount === 0) {
            return (
                <span className={BLOCK_PATTERN_PICKER_COUNT_EMPTY_CLASS}>
                    Elige al menos un patrón
                </span>
            );
        }
        const suffix =
            selectedCount === 1 ? "patrón seleccionado" : "patrones seleccionados";
        return (
            <span className={BLOCK_PATTERN_PICKER_COUNT_ACTIVE_CLASS}>
                <span className={BLOCK_PATTERN_PICKER_COUNT_NUMBER_CLASS}>
                    {selectedCount}
                </span>{" "}
                {suffix}
            </span>
        );
    }, [selectedCount]);

    const description = useMemo(
        () => (
            <PatternPickerDescription
                copySources={copySources}
                onCopyFromDay={onCopyFromDay ?? (() => undefined)}
                showCopyShortcut={showCopyShortcut}
            />
        ),
        [copySources, onCopyFromDay, showCopyShortcut],
    );

    return (
        <NexiaPremiumModal
            isOpen={open}
            onClose={onClose}
            data-testid="block-pattern-picker-sheet"
            description={description}
            descriptionClassName="max-w-none"
            title={
                <>
                    Patrones —{" "}
                    <span className={BLOCK_PATTERN_PICKER_DAY_ACCENT_CLASS}>
                        {dayLabel}
                    </span>
                </>
            }
            footer={
                <div className={BLOCK_PATTERN_PICKER_FOOTER_ROW_CLASS}>
                    <p>{countNode}</p>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onClose}
                        className={cn(NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS)}
                    >
                        Listo
                    </Button>
                </div>
            }
        >
            <PatternSelectorFlatPanel
                catalog={catalog}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                selectedPatternIds={selectedPatternIds}
                onToggle={onToggle}
            />
        </NexiaPremiumModal>
    );
};
