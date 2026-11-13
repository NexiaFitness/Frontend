/**
 * NexiaSearchPicker.tsx — Añadir un elemento de una lista buscando por nombre.
 *
 * Contexto: H10, ficha admin (músculos, patrones, articulaciones, material, etiquetas y
 * alternativas). En escritorio, panel anclado al botón «Añadir», en un portal para que
 * ninguna tarjeta lo recorte; en móvil, hoja inferior (NexiaPremiumModal). Reutilizable
 * en cualquier selector de una lista corta. El disparador es un Button ghost-primary con «+»
 * (05_ACTION_HIERARCHY: acción auxiliar de marca), debajo de la lista a la que añade.
 * Notas de mantenimiento:
 * - El filtro es `filterSearchOptions` (@nexia/shared): sin acentos ni mayúsculas. Lo que
 *   no se puede elegir se enseña desactivado con su motivo, no se esconde.
 * - Teclado: ↑ ↓ mueven, Intro elige, Esc cierra; al cerrar, el foco vuelve al botón
 *   (agent.md §9.1). Sin `triggerLabel` es controlado y se ancla a `anchorRef`.
 * - El `style` del panel solo lleva coordenadas calculadas del ancla (top, left, width),
 *   como FormCombobox y DatePickerButton; el aspecto va en clases.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Search } from "lucide-react";
import { filterSearchOptions, type SearchOption, type SearchResult } from "@nexia/shared/utils/text/searchText";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { NexiaPremiumModal } from "@/components/ui/modals";
import { useIsLgViewport } from "@/hooks/athlete/useIsLgViewport";
import {
    NEXIA_SEARCH_PICKER_BODY,
    NEXIA_SEARCH_PICKER_COPY,
    NEXIA_SEARCH_PICKER_EDGE_PX,
    NEXIA_SEARCH_PICKER_EMPTY,
    NEXIA_SEARCH_PICKER_GAP_PX,
    NEXIA_SEARCH_PICKER_HINT,
    NEXIA_SEARCH_PICKER_INPUT,
    NEXIA_SEARCH_PICKER_LIST,
    NEXIA_SEARCH_PICKER_LIST_SHEET,
    NEXIA_SEARCH_PICKER_OPTION_REASON,
    NEXIA_SEARCH_PICKER_POPOVER,
    NEXIA_SEARCH_PICKER_SEARCH_ICON,
    NEXIA_SEARCH_PICKER_SEARCH_WRAP,
    NEXIA_SEARCH_PICKER_WIDTH_PX,
    nexiaSearchPickerOptionClass,
} from "./nexiaSearchPickerPresentation";

export interface NexiaSearchPickerProps<T extends string | number> {
    /** Título de la hoja y nombre accesible del panel («Añadir sinergista»). */
    title: string;
    description?: string;
    options: readonly SearchOption<T>[];
    /** Elementos que no se pueden elegir, con su motivo. */
    unavailable?: ReadonlyMap<T, string>;
    onSelect: (value: T) => void;
    searchPlaceholder: string;
    emptyText: string;
    /** Texto del botón «Añadir»; sin él, el selector es controlado (open/onOpenChange). */
    triggerLabel?: string;
    triggerClassName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Ancla del panel cuando no hay botón propio. */
    anchorRef?: React.RefObject<HTMLElement | null>;
    disabled?: boolean;
}

interface PanelProps<T extends string | number> {
    listId: string;
    results: SearchResult<T>[];
    query: string;
    setQuery: (query: string) => void;
    onSelect: (value: T) => void;
    onClose: () => void;
    searchPlaceholder: string;
    emptyText: string;
    touch: boolean;
}

function SearchPanel<T extends string | number>({
    listId,
    results,
    query,
    setQuery,
    onSelect,
    onClose,
    searchPlaceholder,
    emptyText,
    touch,
}: PanelProps<T>) {
    const enabled = useMemo(() => results.filter((r) => !r.disabledReason), [results]);
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => setActiveIndex(0), [query]);
    const active = enabled[activeIndex];

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, Math.max(enabled.length - 1, 0)));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (active) onSelect(active.value);
        } else if (event.key === "Escape") {
            event.preventDefault();
            onClose();
        }
    };
    const optionId = (value: T) => `${listId}-${String(value)}`;

    return (
        <div className={NEXIA_SEARCH_PICKER_BODY}>
            <div className={NEXIA_SEARCH_PICKER_SEARCH_WRAP}>
                <Search className={NEXIA_SEARCH_PICKER_SEARCH_ICON} aria-hidden />
                <input
                    autoFocus
                    type="search"
                    role="combobox"
                    aria-expanded
                    aria-controls={listId}
                    aria-activedescendant={active ? optionId(active.value) : undefined}
                    aria-label={searchPlaceholder}
                    placeholder={searchPlaceholder}
                    className={NEXIA_SEARCH_PICKER_INPUT}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={onKeyDown}
                />
            </div>
            <div
                id={listId}
                role="listbox"
                aria-label={searchPlaceholder}
                className={cn(NEXIA_SEARCH_PICKER_LIST, touch && NEXIA_SEARCH_PICKER_LIST_SHEET)}
            >
                {results.length === 0 ? <p className={NEXIA_SEARCH_PICKER_EMPTY}>{emptyText}</p> : null}
                {results.map((option) => {
                    const disabled = option.disabledReason != null;
                    return (
                        <button
                            key={String(option.value)}
                            id={optionId(option.value)}
                            type="button"
                            role="option"
                            tabIndex={-1}
                            aria-selected={active?.value === option.value}
                            aria-disabled={disabled || undefined}
                            className={nexiaSearchPickerOptionClass({
                                active: active?.value === option.value,
                                disabled,
                                touch,
                            })}
                            onClick={() => (disabled ? undefined : onSelect(option.value))}
                        >
                            <span>{option.label}</span>
                            {disabled ? (
                                <span className={NEXIA_SEARCH_PICKER_OPTION_REASON}>
                                    {option.disabledReason}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
            {touch ? null : <p className={NEXIA_SEARCH_PICKER_HINT}>{NEXIA_SEARCH_PICKER_COPY.keyboardHint}</p>}
        </div>
    );
}

function usePopoverPosition(open: boolean, anchor: React.RefObject<HTMLElement | null>) {
    const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const update = useCallback(() => {
        const rect = anchor.current?.getBoundingClientRect();
        if (!rect) return;
        const width = Math.min(NEXIA_SEARCH_PICKER_WIDTH_PX, window.innerWidth - 2 * NEXIA_SEARCH_PICKER_EDGE_PX);
        const left = Math.min(rect.left, window.innerWidth - width - NEXIA_SEARCH_PICKER_EDGE_PX);
        setPosition({ top: rect.bottom + NEXIA_SEARCH_PICKER_GAP_PX, left, width });
    }, [anchor]);
    useLayoutEffect(() => {
        if (!open) return undefined;
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [open, update]);
    return position;
}

export function NexiaSearchPicker<T extends string | number>({
    title,
    description,
    options,
    unavailable,
    onSelect,
    searchPlaceholder,
    emptyText,
    triggerLabel,
    triggerClassName,
    open: controlledOpen,
    onOpenChange,
    anchorRef,
    disabled = false,
}: NexiaSearchPickerProps<T>) {
    const isLg = useIsLgViewport();
    const listId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [innerOpen, setInnerOpen] = useState(false);
    const [query, setQuery] = useState("");
    const open = controlledOpen ?? innerOpen;
    const anchor = anchorRef ?? triggerRef;

    const setOpen = useCallback(
        (next: boolean) => {
            if (controlledOpen === undefined) setInnerOpen(next);
            onOpenChange?.(next);
            if (!next) {
                setQuery("");
                anchor.current?.focus();
            }
        },
        [anchor, controlledOpen, onOpenChange]
    );

    const results = useMemo(
        () => filterSearchOptions(options, query, unavailable),
        [options, query, unavailable]
    );
    const position = usePopoverPosition(open && isLg, anchor);

    useEffect(() => {
        if (!open || !isLg) return undefined;
        const onPointer = (event: MouseEvent) => {
            const target = event.target as Node;
            if (panelRef.current?.contains(target) || anchor.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onPointer);
        return () => document.removeEventListener("mousedown", onPointer);
    }, [anchor, isLg, open, setOpen]);

    const choose = (value: T) => {
        onSelect(value);
        setOpen(false);
    };
    const panel = (
        <SearchPanel
            listId={listId}
            results={results}
            query={query}
            setQuery={setQuery}
            onSelect={choose}
            onClose={() => setOpen(false)}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            touch={!isLg}
        />
    );

    return (
        <>
            {triggerLabel ? (
                <Button
                    ref={triggerRef}
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    onClick={() => setOpen(!open)}
                    disabled={disabled}
                    className={triggerClassName}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                >
                    <Plus aria-hidden />
                    {triggerLabel}
                </Button>
            ) : null}
            {open && isLg && position
                ? createPortal(
                      <div
                          ref={panelRef}
                          role="dialog"
                          aria-label={title}
                          className={NEXIA_SEARCH_PICKER_POPOVER}
                          style={{ top: position.top, left: position.left, width: position.width }}
                      >
                          {panel}
                      </div>,
                      document.body
                  )
                : null}
            {!isLg ? (
                <NexiaPremiumModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    title={title}
                    description={description}
                    maxWidth="md"
                >
                    {panel}
                </NexiaPremiumModal>
            ) : null}
        </>
    );
}
