/**
 * NexiaSectionCard.tsx — Tarjeta de sección de un formulario: abierta en escritorio, plegable en móvil.
 *
 * Contexto: H10, ficha admin del catálogo (DISENO_H10_FICHA_ADMIN §2). En escritorio todas
 * las secciones están a la vista; por debajo de `lg` cada una se pliega y, cerrada, enseña
 * un resumen y cuántos errores tiene. Reutilizable en cualquier formulario largo.
 * Notas de mantenimiento: la apertura la controla quien la usa (open / onOpenChange), así
 * que la pantalla puede abrir las tarjetas con errores al guardar. En escritorio la
 * cabecera no es un botón: no hay nada que plegar.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsLgViewport } from "@/hooks/athlete/useIsLgViewport";
import { NexiaGlassAccentRim } from "./NexiaGlassAccentRim";
import {
    NEXIA_ERROR_COUNT_BADGE,
    NEXIA_ERROR_COUNT_COPY,
} from "./platformPremiumPresentation";
import {
    NEXIA_SECTION_CARD,
    NEXIA_SECTION_CARD_ASIDE,
    NEXIA_SECTION_CARD_ASIDE_INLINE,
    NEXIA_SECTION_CARD_BODY,
    NEXIA_SECTION_CARD_CHEVRON,
    NEXIA_SECTION_CARD_CHEVRON_OPEN,
    NEXIA_SECTION_CARD_HEADER,
    NEXIA_SECTION_CARD_HEADER_ACTION,
    NEXIA_SECTION_CARD_SUMMARY,
    NEXIA_SECTION_CARD_TITLE,
    NEXIA_SECTION_CARD_TOGGLE,
} from "./nexiaSectionCardPresentation";

export interface NexiaSectionCardProps {
    id: string;
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    /** Resumen de una línea, visible con la tarjeta cerrada (móvil). */
    summary?: React.ReactNode;
    /** Nota corta a la derecha del título, solo en escritorio. */
    aside?: React.ReactNode;
    /** Control propio de la cabecera (p. ej. un segmentado), solo en escritorio. */
    headerAction?: React.ReactNode;
    errorCount?: number;
    className?: string;
    bodyClassName?: string;
}

function ErrorCount({ count }: { count: number }) {
    if (count <= 0) return null;
    const label = NEXIA_ERROR_COUNT_COPY.errorCount(count);
    return (
        <span className={NEXIA_ERROR_COUNT_BADGE} role="img" aria-label={label} title={label}>
            {count}
        </span>
    );
}

export const NexiaSectionCard: React.FC<NexiaSectionCardProps> = ({
    id,
    title,
    open,
    onOpenChange,
    children,
    summary,
    aside,
    headerAction,
    errorCount = 0,
    className,
    bodyClassName,
}) => {
    const isLg = useIsLgViewport();
    const titleId = `${id}-title`;
    const bodyId = `${id}-body`;
    const expanded = isLg || open;

    return (
        <section id={id} aria-labelledby={titleId} className={cn(NEXIA_SECTION_CARD, className)}>
            <NexiaGlassAccentRim />
            {isLg ? (
                <div className={NEXIA_SECTION_CARD_HEADER}>
                    <h2 id={titleId} className={NEXIA_SECTION_CARD_TITLE}>
                        {title}
                    </h2>
                    <ErrorCount count={errorCount} />
                    {aside ? (
                        <span className={headerAction ? NEXIA_SECTION_CARD_ASIDE_INLINE : NEXIA_SECTION_CARD_ASIDE}>
                            {aside}
                        </span>
                    ) : null}
                    {headerAction ? (
                        <div className={NEXIA_SECTION_CARD_HEADER_ACTION}>{headerAction}</div>
                    ) : null}
                </div>
            ) : (
                <button
                    type="button"
                    className={NEXIA_SECTION_CARD_TOGGLE}
                    aria-expanded={open}
                    aria-controls={bodyId}
                    onClick={() => onOpenChange(!open)}
                >
                    <h2 id={titleId} className={NEXIA_SECTION_CARD_TITLE}>
                        {title}
                    </h2>
                    <ErrorCount count={errorCount} />
                    {!open && summary ? (
                        <span className={NEXIA_SECTION_CARD_SUMMARY}>{summary}</span>
                    ) : null}
                    <ChevronDown
                        className={cn(
                            NEXIA_SECTION_CARD_CHEVRON,
                            (open || !summary) && "ml-auto",
                            open && NEXIA_SECTION_CARD_CHEVRON_OPEN
                        )}
                        aria-hidden
                    />
                </button>
            )}
            {expanded ? (
                <div id={bodyId} className={cn(NEXIA_SECTION_CARD_BODY, bodyClassName)}>
                    {children}
                </div>
            ) : null}
        </section>
    );
};
