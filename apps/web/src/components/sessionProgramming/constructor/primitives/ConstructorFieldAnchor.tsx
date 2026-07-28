/**
 * ConstructorFieldAnchor — Ancla scroll/focus + error inline en campos del constructor.
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { ConstructorValidationField } from "../../constructorTypes";
import { constructorValidationFieldKey } from "../../constructorTypes";
import { useConstructorValidationContext } from "../useConstructorValidationContext";

export interface ConstructorFieldAnchorProps {
    rowId: string;
    field: ConstructorValidationField;
    exerciseSlotId?: string;
    className?: string;
    children: React.ReactNode;
}

export function ConstructorFieldAnchor({
    rowId,
    field,
    exerciseSlotId,
    className,
    children,
}: ConstructorFieldAnchorProps): React.ReactElement {
    const { getFieldError } = useConstructorValidationContext();
    const error = getFieldError(rowId, field, exerciseSlotId);
    const fieldKey = constructorValidationFieldKey(rowId, field, exerciseSlotId);
    const errorId = error ? `${fieldKey}-error` : undefined;

    return (
        <div
            className={cn("min-w-0", className)}
            data-constructor-field={fieldKey}
            data-constructor-row-id={rowId}
        >
            {children}
            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="mt-1 text-[10px] leading-snug text-destructive"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}

