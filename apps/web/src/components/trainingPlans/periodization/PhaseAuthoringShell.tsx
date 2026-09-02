/**
 * PhaseAuthoringShell.tsx — Layout D-SAF para autoría por fase (F2).
 *
 * Contexto: reemplaza el layout 60/40 legacy cuando hay constructor activo.
 * Colabora con PhaseSectionNav, PhaseSaveBar y PhaseSummaryPanel.
 *
 * Notas de mantenimiento: solo estructura de columnas; el padre inyecta contenido.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    PHASE_SHELL_DETAIL_CLASS,
    PHASE_SHELL_LAYOUT_CLASS,
    PHASE_SHELL_MASTER_CLASS,
} from "./phaseConstructorPresentation";

interface Props {
    master: React.ReactNode;
    detail: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export const PhaseAuthoringShell: React.FC<Props> = ({
    master,
    detail,
    footer,
    className,
}) => (
    <div className={cn(PHASE_SHELL_LAYOUT_CLASS, className)}>
        <aside className={PHASE_SHELL_MASTER_CLASS}>{master}</aside>
        <div className={PHASE_SHELL_DETAIL_CLASS}>
            {detail}
            {footer}
        </div>
    </div>
);
