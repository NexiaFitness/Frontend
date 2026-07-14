/**
 * ConstructorCardHeader.tsx — Cabecera Lovable: bloque + tipo serie + acciones.
 * Contexto: nombre de bloque, selector setType y duplicar / eliminar / colapsar.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import { FormCombobox } from "@/components/ui/forms";
import type { SetType, TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE_LABELS } from "@nexia/shared/types/sessionProgramming";
import { getTrainingBlockDisplayName } from "../utils/trainingBlockDisplay";
import {
    CONSTRUCTOR_BLOCK_DOT_CLASS,
    CONSTRUCTOR_CARD_HEADER_CLASS,
    CONSTRUCTOR_CARD_HEADER_LEFT_CLASS,
    CONSTRUCTOR_HEADER_ICON_BTN_CLASS,
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
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    onDuplicate?: () => void;
    onRemove?: () => void;
}

export const ConstructorCardHeader: React.FC<ConstructorCardHeaderProps> = ({
    blockTypeId,
    blockTypes,
    setType,
    onSetTypeChange,
    collapsed = false,
    onToggleCollapse,
    onDuplicate,
    onRemove,
}) => {
    const blockType = blockTypes.find((bt) => bt.id === blockTypeId);
    const blockLabel = blockType
        ? getTrainingBlockDisplayName(blockType.name)
        : "Bloque";

    return (
        <div className={CONSTRUCTOR_CARD_HEADER_CLASS}>
            <div className={CONSTRUCTOR_CARD_HEADER_LEFT_CLASS}>
                <span className={CONSTRUCTOR_BLOCK_DOT_CLASS} aria-hidden />
                <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-foreground">
                    {blockLabel}
                </span>
                <FormCombobox
                    size="xs"
                    value={setType}
                    onChange={(value) => onSetTypeChange(value as SetType)}
                    options={SET_TYPE_OPTIONS}
                    className="w-[118px] shrink-0"
                    buttonClassName={CONSTRUCTOR_SET_TYPE_SELECT_CLASS}
                    ariaLabel="Tipo de serie"
                />
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
                {onDuplicate ? (
                    <button
                        type="button"
                        onClick={onDuplicate}
                        className={CONSTRUCTOR_HEADER_ICON_BTN_CLASS}
                        aria-label="Duplicar serie"
                    >
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                    </button>
                ) : null}
                {onRemove ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className={CONSTRUCTOR_HEADER_ICON_BTN_CLASS}
                        aria-label="Eliminar serie"
                    >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                ) : null}
                {onToggleCollapse ? (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className={CONSTRUCTOR_HEADER_ICON_BTN_CLASS}
                        aria-label={collapsed ? "Expandir serie" : "Minimizar serie"}
                        aria-expanded={!collapsed}
                    >
                        {collapsed ? (
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                        )}
                    </button>
                ) : null}
            </div>
        </div>
    );
};
