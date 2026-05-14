/**
 * ConstructorBlockShell.tsx — Shell legacy (tipos aún no migrados a card propia).
 * Contexto: envuelve LegacyRowBlock; cabecera alineada con diseño Lovable.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import type { SetType, TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { ConstructorCardHeader } from "./primitives/ConstructorCardHeader";
import { CONSTRUCTOR_CARD_CLASS } from "./primitives/constructorCardStyles";

export interface ConstructorBlockShellProps {
    blockTypeId: number;
    blockTypes: TrainingBlockType[];
    setType: SetType;
    onSetTypeChange: (setType: SetType) => void;
    children: React.ReactNode;
    className?: string;
    onDuplicate?: () => void;
    onRemove?: () => void;
}

export const ConstructorBlockShell: React.FC<ConstructorBlockShellProps> = ({
    blockTypeId,
    blockTypes,
    setType,
    onSetTypeChange,
    children,
    className,
    onDuplicate,
    onRemove,
}) => {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <div className={className ?? CONSTRUCTOR_CARD_CLASS}>
            <ConstructorCardHeader
                blockTypeId={blockTypeId}
                blockTypes={blockTypes}
                setType={setType}
                onSetTypeChange={onSetTypeChange}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
            />
            {!collapsed ? <div>{children}</div> : null}
        </div>
    );
};
