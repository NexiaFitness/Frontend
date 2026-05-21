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
    CONSTRUCTOR_CARD_HEADER_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../constructor/primitives/constructorCardStyles";
import { detailStyleForKind } from "./detailStyles";

export interface DetailCardShellProps {
    kind: SessionGroupKind;
    /** Nombre del bloque (Hipertrofia, Acondicionamiento…). */
    blockTitle: string;
    /** Slot a la derecha del título (badge de tipo serie). */
    headerTrailing?: React.ReactNode;
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
    headerTrailing,
    paramsBar,
    children,
    hint,
    className,
}) => {
    const style = detailStyleForKind(kind);

    return (
        <article className={cn(style.cardClass, className)}>
            <header className={CONSTRUCTOR_CARD_HEADER_CLASS}>
                <div className="flex items-center gap-2">
                    <span className={CONSTRUCTOR_BLOCK_DOT_CLASS} aria-hidden />
                    <span className="text-sm font-semibold text-foreground">{blockTitle}</span>
                </div>
                {headerTrailing && (
                    <div className="flex items-center gap-2">{headerTrailing}</div>
                )}
            </header>

            {paramsBar && <div className={style.groupBarClass}>{paramsBar}</div>}

            <div className="space-y-4 px-4 pt-3 pb-3">{children}</div>

            {hint && <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>{hint}</p>}
        </article>
    );
};
