/**
 * ConstructorCardHeader.tsx — Cabecera Lovable: bloque + tipo serie en línea.
 * Contexto: nombre de bloque (desde tabs) y selector setType adyacente.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormSelect } from "@/components/ui/forms";
import type { SetType, TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE_LABELS } from "@nexia/shared/types/sessionProgramming";
import { getTrainingBlockDisplayName } from "../utils/trainingBlockDisplay";
import {
    CONSTRUCTOR_BLOCK_DOT_CLASS,
    CONSTRUCTOR_CARD_HEADER_CLASS,
    CONSTRUCTOR_SET_TYPE_SELECT_CLASS,
} from "./constructorCardStyles";

const SET_TYPE_OPTIONS = Object.entries(SET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export interface ConstructorCardHeaderProps {
    blockTypeId: number;
    blockTypes: TrainingBlockType[];
    setType: SetType;
    onSetTypeChange: (setType: SetType) => void;
}

export const ConstructorCardHeader: React.FC<ConstructorCardHeaderProps> = ({
    blockTypeId,
    blockTypes,
    setType,
    onSetTypeChange,
}) => {
    const blockType = blockTypes.find((bt) => bt.id === blockTypeId);
    const blockLabel = blockType
        ? getTrainingBlockDisplayName(blockType.name)
        : "Bloque";

    return (
        <div className={CONSTRUCTOR_CARD_HEADER_CLASS}>
            <span className={CONSTRUCTOR_BLOCK_DOT_CLASS} aria-hidden />
            <span className="text-sm font-semibold text-foreground shrink-0">
                {blockLabel}
            </span>
            <FormSelect
                size="xs"
                value={setType}
                onChange={(e) => onSetTypeChange(e.target.value as SetType)}
                options={SET_TYPE_OPTIONS}
                className={CONSTRUCTOR_SET_TYPE_SELECT_CLASS}
                aria-label="Tipo de serie"
            />
        </div>
    );
};
