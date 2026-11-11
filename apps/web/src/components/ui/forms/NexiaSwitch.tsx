/**
 * NexiaSwitch.tsx — Interruptor premium con su etiqueta (role="switch").
 *
 * Contexto: H10. La ficha admin marca «Revisado» con él y el portal atleta ya usa la
 * misma receta (nexiaSwitchPresentation). Sustituye a la casilla `Checkbox`, que es legacy
 * (grises, sin variante premium), allí donde se activa o desactiva un estado.
 * Notas de mantenimiento: la etiqueta es un <label> asociado, así que pulsar el texto
 * cambia el estado y el lector de pantalla lo anuncia como interruptor.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    NEXIA_SWITCH_LABEL,
    NEXIA_SWITCH_ROW,
    nexiaSwitchThumbClass,
    nexiaSwitchTrackClass,
} from "./nexiaSwitchPresentation";

export interface NexiaSwitchProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    "data-testid"?: string;
}

export const NexiaSwitch: React.FC<NexiaSwitchProps> = ({
    id,
    label,
    checked,
    onChange,
    disabled = false,
    className,
    "data-testid": testId,
}) => (
    <span className={cn(NEXIA_SWITCH_ROW, disabled && "cursor-not-allowed", className)}>
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={nexiaSwitchTrackClass(checked, disabled)}
            data-testid={testId}
        >
            <span className={nexiaSwitchThumbClass(checked)} aria-hidden />
        </button>
        <label htmlFor={id} className={NEXIA_SWITCH_LABEL}>
            {label}
        </label>
    </span>
);
