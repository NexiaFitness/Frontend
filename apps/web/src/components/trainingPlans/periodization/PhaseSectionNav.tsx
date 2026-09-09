/**
 * PhaseSectionNav.tsx — Anclas del constructor de fase (F2 D-SAF).
 *
 * Contexto: segmented control horizontal para saltar entre secciones del shell de
 * autoría. Delega ids, orden y etiquetas en phaseSectionNavModel.
 *
 * Notas de mantenimiento: solo exporta el componente React; tokens visuales en
 * phaseConstructorPresentation; mapeos de paso en phaseSectionNavModel.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    PHASE_SECTION_NAV_CLASS,
    PHASE_SECTION_NAV_SCROLL_CLASS,
    PHASE_SECTION_NAV_TRACK_CLASS,
    phaseSectionNavItemClass,
} from "./phaseConstructorPresentation";
import {
    PHASE_SECTION_LABELS,
    PHASE_SECTION_ORDER,
    type PhaseSectionId,
} from "./phaseSectionNavModel";

interface Props {
    activeSection: PhaseSectionId;
    onSectionChange: (section: PhaseSectionId) => void;
    className?: string;
}

export const PhaseSectionNav: React.FC<Props> = ({
    activeSection,
    onSectionChange,
    className,
}) => (
    <nav
        className={cn(PHASE_SECTION_NAV_CLASS, className)}
        aria-label="Secciones de la fase"
    >
        <div className={PHASE_SECTION_NAV_SCROLL_CLASS}>
            <div className={PHASE_SECTION_NAV_TRACK_CLASS}>
                {PHASE_SECTION_ORDER.map((section) => (
                    <button
                        key={section}
                        type="button"
                        className={phaseSectionNavItemClass(activeSection === section)}
                        onClick={() => onSectionChange(section)}
                    >
                        {PHASE_SECTION_LABELS[section]}
                    </button>
                ))}
            </div>
        </div>
    </nav>
);
