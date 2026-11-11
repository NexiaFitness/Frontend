/**
 * RemovableChip.tsx — Un valor elegido en una selección múltiple, con su botón de quitar.
 *
 * Contexto: H10, ficha admin. Pareja de AddPill: el chip enseña lo elegido y AddPill
 * (o NexiaSearchPicker) añade más. `children` admite un control extra dentro del chip,
 * por ejemplo el rol «primario / secundario» de un patrón.
 * Notas de mantenimiento: el botón lleva aria-label con el nombre, porque solo es un icono.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React from "react";
import { X } from "lucide-react";
import {
    REMOVABLE_CHIP_LABEL,
    REMOVABLE_CHIP_REMOVE,
    removableChipClass,
    type RemovableChipTone,
} from "./removableChipPresentation";

export interface RemovableChipProps {
    label: string;
    onRemove: () => void;
    /** Texto accesible del botón: «Quitar {label}». */
    removeLabel: string;
    tone?: RemovableChipTone;
    /** Clases de tono propias (p. ej. el color del patrón); sustituyen a `tone`. */
    toneClassName?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

export const RemovableChip: React.FC<RemovableChipProps> = ({
    label,
    onRemove,
    removeLabel,
    tone = "neutral",
    toneClassName,
    children,
    disabled = false,
}) => (
    <span className={removableChipClass(tone, toneClassName)}>
        <span className={REMOVABLE_CHIP_LABEL}>{label}</span>
        {children}
        <button
            type="button"
            className={REMOVABLE_CHIP_REMOVE}
            aria-label={removeLabel}
            onClick={onRemove}
            disabled={disabled}
        >
            <X aria-hidden />
        </button>
    </span>
);
