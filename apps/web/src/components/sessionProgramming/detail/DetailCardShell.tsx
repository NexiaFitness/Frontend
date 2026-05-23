/**
 * DetailCardShell.tsx — Shell read-only de bloque de sesión.
 *
 * Reutiliza tokens del constructor (`constructorCardStyles.ts`) para preservar
 * la coherencia visual con el editor, pero sin inputs ni acciones.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import type { SessionGroupKind } from "@nexia/shared";
import { cn } from "@/lib/utils";
import {
    CONSTRUCTOR_BLOCK_DOT_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../constructor/primitives/constructorCardStyles";
import { DETAIL_HEADER_BADGE_SIZE_CLASS, detailStyleForKind } from "./detailStyles";

export interface DetailCardShellProps {
    kind: SessionGroupKind;
    /** Nombre del bloque (Hipertrofia, Acondicionamiento…). */
    blockTitle: string;
    /** Etiqueta de tipo de serie (DROP SET A, SUPERSET A…), antes del nombre de bloque. */
    seriesBadgeLabel?: string;
    /** Barra de parámetros (rondas, time cap, descanso…). */
    paramsBar?: React.ReactNode;
    /** Cuerpo de la card. */
    children: React.ReactNode;
    /** Texto del hint inferior. */
    hint?: string | null;
    className?: string;
}

export const DetailCardShell: React.FC<DetailCardShellProps> = ({
    kind,
    blockTitle,
    seriesBadgeLabel,
    paramsBar,
    children,
    hint,
    className,
}) => {
    const style = detailStyleForKind(kind);

    return (
        <article className={cn(style.cardClass, className)}>
            <header className="flex items-center gap-3 border-b border-border/50 bg-surface/40 px-4 py-2">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {seriesBadgeLabel && (
                        <span
                            className={cn(
                                style.badgeClass,
                                DETAIL_HEADER_BADGE_SIZE_CLASS,
                                "shrink-0"
                            )}
                        >
                            {seriesBadgeLabel}
                        </span>
                    )}
                    <span className={CONSTRUCTOR_BLOCK_DOT_CLASS} aria-hidden />
                    <span className="truncate text-sm font-semibold text-foreground">
                        {blockTitle}
                    </span>
                </div>
            </header>

            {paramsBar && <div className={style.groupBarClass}>{paramsBar}</div>}

            <div className="space-y-4 px-4 pt-3 pb-3">{children}</div>

            {hint && <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>{hint}</p>}
        </article>
    );
};
