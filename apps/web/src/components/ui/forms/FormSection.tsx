/**
 * FormSection — Card wrapper for form sections with icon header.
 *
 * Used in onboarding, client edit, and progress forms to group
 * related fields inside a titled card with a colored icon.
 *
 * Visual: tokens PLATFORM_ONBOARDING_* (DESIGN_PREMIUM §5.3).
 *
 * @author Frontend Team
 * @since v7.0.0
 */

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import {
    PLATFORM_FORM_SECTION_TITLE,
    PLATFORM_ONBOARDING_SECTION,
    PLATFORM_ONBOARDING_SECTION_BODY,
    PLATFORM_ONBOARDING_SECTION_FOOTER,
    PLATFORM_ONBOARDING_SECTION_HEADER,
    PLATFORM_ONBOARDING_SECTION_ICON,
    PLATFORM_ONBOARDING_SECTION_TITLE,
} from "./platformFormPresentation";

export interface FormSectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
    /** Pie de sección (p. ej. Guardar cambios en edit). */
    footer?: React.ReactNode;
    /** Eyebrow cyan sobre el título (opcional). */
    eyebrow?: string;
    /** Descripción bajo el título. */
    description?: string;
    /** id del heading para aria-labelledby (edit E2E / a11y). */
    headingId?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
    icon,
    title,
    children,
    className,
    footer,
    eyebrow,
    description,
    headingId,
}) => {
    const autoId = useId();
    const resolvedHeadingId = headingId ?? `form-section-title-${autoId}`;

    return (
        <section
            role="region"
            aria-labelledby={resolvedHeadingId}
            className={cn(PLATFORM_ONBOARDING_SECTION, className)}
        >
            <div className={PLATFORM_ONBOARDING_SECTION_BODY}>
                <div className={PLATFORM_ONBOARDING_SECTION_HEADER}>
                    <div className={PLATFORM_ONBOARDING_SECTION_ICON}>{icon}</div>
                    <div className="min-w-0 flex-1">
                        {eyebrow ? (
                            <p className={cn(PLATFORM_FORM_SECTION_TITLE, "mb-1")}>{eyebrow}</p>
                        ) : null}
                        <h2 id={resolvedHeadingId} className={PLATFORM_ONBOARDING_SECTION_TITLE}>
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                        ) : null}
                    </div>
                </div>
                {children}
                {footer ? (
                    <div className={PLATFORM_ONBOARDING_SECTION_FOOTER}>{footer}</div>
                ) : null}
            </div>
        </section>
    );
};
