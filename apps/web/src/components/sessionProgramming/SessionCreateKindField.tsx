/**
 * SessionCreateKindField — Superficie D2 según resolveSessionCreateKindUi (premium).
 */

import React from "react";

import type { SessionCreateKindUi } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

import { SessionCreateKindSelector, type SessionCreateKind } from "./SessionCreateKindSelector";
import {
    SESSION_CREATE_KIND_COPY,
    SESSION_CREATE_KIND_ESCAPE,
    SESSION_CREATE_KIND_IMPLICIT_HINT,
    SESSION_CREATE_KIND_IMPLICIT_TITLE,
    SESSION_CREATE_KIND_IMPLICIT_WRAP,
    SESSION_CREATE_KIND_ROW,
} from "./sessionCreateKindPresentation";

export interface SessionCreateKindFieldProps {
    ui: SessionCreateKindUi;
    value: SessionCreateKind;
    onChange: (value: SessionCreateKind) => void;
    disabled?: boolean;
    className?: string;
}

export const SessionCreateKindField: React.FC<SessionCreateKindFieldProps> = ({
    ui,
    value,
    onChange,
    disabled = false,
    className,
}) => {
    if (ui.variant === "none") {
        return null;
    }

    if (ui.variant === "segmented") {
        return (
            <SessionCreateKindSelector
                className={className}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        );
    }

    return (
        <div className={cn(SESSION_CREATE_KIND_ROW, className)}>
            <div className={SESSION_CREATE_KIND_IMPLICIT_WRAP}>
                <p className={SESSION_CREATE_KIND_IMPLICIT_TITLE}>
                    {SESSION_CREATE_KIND_COPY.implicitStandaloneLabel}
                </p>
                <p className={SESSION_CREATE_KIND_IMPLICIT_HINT}>
                    No se vinculará al programa en esta fecha.
                </p>
            </div>
            {ui.showProgramSwitch ? (
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={cn(SESSION_CREATE_KIND_ESCAPE, "h-8 px-2 text-xs")}
                    disabled={disabled}
                    onClick={() => onChange("program")}
                >
                    {SESSION_CREATE_KIND_COPY.switchToProgram}
                </Button>
            ) : null}
        </div>
    );
};
