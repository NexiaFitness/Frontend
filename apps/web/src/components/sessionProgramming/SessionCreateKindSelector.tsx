/**
 * D2 — Conmutador premium Programa vs Sesión suelta (TabsBar / segmented).
 */

import React from "react";

import { cn } from "@/lib/utils";
import { TabsBar } from "@/components/ui/tabs/TabsBar";

import {
    SESSION_CREATE_KIND_COPY,
    SESSION_CREATE_KIND_SEGMENTED,
} from "./sessionCreateKindPresentation";

export type SessionCreateKind = "program" | "standalone";

export interface SessionCreateKindSelectorProps {
    value: SessionCreateKind;
    onChange: (value: SessionCreateKind) => void;
    disabled?: boolean;
    className?: string;
}

export const SessionCreateKindSelector: React.FC<SessionCreateKindSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    className,
}) => (
    <TabsBar
        className={cn(SESSION_CREATE_KIND_SEGMENTED, className)}
        ariaLabel={SESSION_CREATE_KIND_COPY.segmentedAriaLabel}
        distribute="equal"
        value={value}
        onChange={(id) => onChange(id as SessionCreateKind)}
        items={[
            {
                id: "program",
                label: SESSION_CREATE_KIND_COPY.program,
                disabled,
            },
            {
                id: "standalone",
                label: SESSION_CREATE_KIND_COPY.standalone,
                disabled,
            },
        ]}
    />
);
