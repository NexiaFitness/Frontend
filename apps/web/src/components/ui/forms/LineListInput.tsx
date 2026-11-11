/**
 * LineListInput.tsx — Lista ordenada de frases cortas, un campo por línea (pasos, consejos).
 *
 * Contexto: H10, técnica del ejercicio (DISENO_H10_FICHA_ADMIN §3). Escribir paso a paso
 * se lee mejor que un área de texto con saltos de línea, y el número de cada paso se ve
 * mientras se escribe. Reutilizable para cualquier lista de frases.
 * Notas de mantenimiento:
 * - Intro crea la línea siguiente; Borrar en una línea vacía la quita y vuelve a la
 *   anterior; pegar varias líneas crea una entrada por línea (`splitPaste`, p. ej.
 *   `splitPastedLines` de @nexia/shared, que quita la numeración pegada).
 * - Las operaciones son las de `listOps` (@nexia/shared): el componente solo pinta y
 *   mueve el foco. `minItems` 1 deja siempre un campo visible.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { insertAfter, removeAt, replaceAt } from "@nexia/shared/utils/listOps";
import { cn } from "@/lib/utils";
import { AddPill } from "@/components/ui/chips";
import { PLATFORM_FORM_FIELD_LABEL } from "./platformFormPresentation";
import {
    LINE_LIST,
    LINE_LIST_ERROR,
    LINE_LIST_FIELD,
    LINE_LIST_FIELD_INVALID,
    LINE_LIST_FOOTER,
    LINE_LIST_HELPER,
    LINE_LIST_MARKER,
    LINE_LIST_MARKER_BULLET,
    LINE_LIST_MARKER_NUMBER,
    LINE_LIST_REMOVE,
    LINE_LIST_ROW,
} from "./lineListInputPresentation";

export interface LineListInputProps {
    id: string;
    label: React.ReactNode;
    items: string[];
    onChange: (items: string[]) => void;
    marker: "number" | "bullet";
    /** Nombre de una línea para el lector de pantalla: «Paso 2», «Consejo 1». */
    itemLabel: (index: number) => string;
    addLabel: string;
    maxItems: number;
    minItems?: 0 | 1;
    placeholder?: (index: number) => string;
    splitPaste: (text: string) => string[];
    helperText?: React.ReactNode;
    error?: string | null;
}

export const LineListInput: React.FC<LineListInputProps> = ({
    id,
    label,
    items,
    onChange,
    marker,
    itemLabel,
    addLabel,
    maxItems,
    minItems = 0,
    placeholder,
    splitPaste,
    helperText,
    error,
}) => {
    const fields = useRef<Array<HTMLTextAreaElement | null>>([]);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const labelId = `${id}-label`;
    const errorId = `${id}-error`;

    useEffect(() => {
        if (focusIndex == null) return;
        const field = fields.current[focusIndex];
        if (field) {
            field.focus();
            field.setSelectionRange(field.value.length, field.value.length);
        }
        setFocusIndex(null);
    }, [focusIndex, items]);

    const add = (after: number) => {
        if (items.length >= maxItems) return;
        onChange(insertAfter(items, after, [""]));
        setFocusIndex(after + 1);
    };

    const remove = (index: number) => {
        if (items.length > minItems) {
            onChange(removeAt(items, index));
            setFocusIndex(Math.max(index - 1, 0));
        } else {
            onChange(replaceAt(items, index, [""]));
            setFocusIndex(index);
        }
    };

    const onKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            add(index);
        } else if (event.key === "Backspace" && items[index] === "" && items.length > Math.max(minItems, 1)) {
            event.preventDefault();
            remove(index);
        }
    };

    const onPaste = (index: number) => (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = event.clipboardData.getData("text");
        if (!/\r|\n/.test(text)) return;
        event.preventDefault();
        const current = items[index]?.trim() ?? "";
        const pasted = splitPaste(text);
        const room = maxItems - items.length + 1;
        const entries = (current ? [current, ...pasted] : pasted).slice(0, Math.max(room, 1));
        onChange(replaceAt(items, index, entries));
        setFocusIndex(index + entries.length - 1);
    };

    return (
        <div role="group" aria-labelledby={labelId} aria-describedby={error ? errorId : undefined}>
            <p id={labelId} className={PLATFORM_FORM_FIELD_LABEL}>
                {label}
            </p>
            {items.length > 0 ? (
                <ol className={LINE_LIST}>
                    {items.map((item, index) => (
                        <li key={index} className={LINE_LIST_ROW}>
                            <span
                                className={cn(
                                    LINE_LIST_MARKER,
                                    marker === "number" ? LINE_LIST_MARKER_NUMBER : LINE_LIST_MARKER_BULLET
                                )}
                                aria-hidden
                            >
                                {marker === "number" ? index + 1 : "•"}
                            </span>
                            <textarea
                                ref={(node) => {
                                    fields.current[index] = node;
                                }}
                                rows={1}
                                aria-label={itemLabel(index)}
                                aria-invalid={error ? true : undefined}
                                placeholder={placeholder?.(index)}
                                className={cn(LINE_LIST_FIELD, error && LINE_LIST_FIELD_INVALID)}
                                value={item}
                                onChange={(event) => onChange(replaceAt(items, index, [event.target.value]))}
                                onKeyDown={onKeyDown(index)}
                                onPaste={onPaste(index)}
                            />
                            <button
                                type="button"
                                className={LINE_LIST_REMOVE}
                                aria-label={`Quitar ${itemLabel(index).toLocaleLowerCase("es")}`}
                                disabled={items.length <= minItems && item === ""}
                                onClick={() => remove(index)}
                            >
                                <X aria-hidden />
                            </button>
                        </li>
                    ))}
                </ol>
            ) : null}
            {error ? (
                <p id={errorId} className={LINE_LIST_ERROR}>
                    {error}
                </p>
            ) : null}
            <div className={LINE_LIST_FOOTER}>
                <AddPill
                    label={addLabel}
                    onClick={() => add(items.length - 1)}
                    disabled={items.length >= maxItems}
                />
                {helperText ? <span className={LINE_LIST_HELPER}>{helperText}</span> : null}
            </div>
        </div>
    );
};
