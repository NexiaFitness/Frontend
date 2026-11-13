/**
 * useAdminCatalogCards.ts — Qué tarjetas de la ficha están abiertas y cuántos errores tiene cada una.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §2). En móvil las tarjetas se pliegan; al guardar
 * con errores se abren las que los tienen y la página baja a la primera. En escritorio
 * todas están abiertas (NexiaSectionCard lo resuelve) y solo cuenta el desplazamiento.
 * Notas de mantenimiento: la correspondencia sección de validación → tarjeta está en
 * SECTION_CARD; una sección nueva de validación necesita su tarjeta ahí.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { useCallback, useMemo, useState } from "react";
import type { AdminCatalogSectionId } from "./adminCatalogFormTypes";
import type { AdminCatalogCardId } from "./adminCatalogFichaPresentation";

const SECTION_CARD: Record<AdminCatalogSectionId, AdminCatalogCardId> = {
    datos: "datos",
    tecnica: "tecnica",
    musculos: "musculos",
    patrones: "movimiento",
    articulaciones: "movimiento",
    material: "material",
    etiquetas: "material",
    alternativas: "relaciones",
    variantes: "relaciones",
};

/** Orden de las tarjetas en la página móvil: la primera con error es la de arriba. */
export const CARD_ORDER: AdminCatalogCardId[] = [
    "datos",
    "musculos",
    "cuenta",
    "relaciones",
    "material",
    "movimiento",
    "tecnica",
];

const OPEN_ON_EDIT: AdminCatalogCardId[] = ["datos", "musculos", "cuenta"];
const OPEN_ON_CREATE: AdminCatalogCardId[] = ["datos", "musculos", "cuenta", "tecnica"];

export function cardErrorCounts(
    errors: Partial<Record<AdminCatalogSectionId, string[]>>
): Partial<Record<AdminCatalogCardId, number>> {
    const counts: Partial<Record<AdminCatalogCardId, number>> = {};
    for (const [section, messages] of Object.entries(errors)) {
        const card = SECTION_CARD[section as AdminCatalogSectionId];
        counts[card] = (counts[card] ?? 0) + (messages?.length ?? 0);
    }
    return counts;
}

export function useAdminCatalogCards(mode: "create" | "edit") {
    const [open, setOpenSet] = useState<Set<AdminCatalogCardId>>(
        () => new Set(mode === "create" ? OPEN_ON_CREATE : OPEN_ON_EDIT)
    );

    const isOpen = useCallback((id: AdminCatalogCardId) => open.has(id), [open]);

    const setOpen = useCallback((id: AdminCatalogCardId, next: boolean) => {
        setOpenSet((prev) => {
            const copy = new Set(prev);
            if (next) copy.add(id);
            else copy.delete(id);
            return copy;
        });
    }, []);

    /** Abre la tarjeta y baja hasta ella; el foco va a su primer campo con error o a la tarjeta. */
    const reveal = useCallback(
        (id: AdminCatalogCardId) => {
            setOpen(id, true);
            window.requestAnimationFrame(() => {
                const card = document.getElementById(`ficha-${id}`);
                if (!card) return;
                if (typeof card.scrollIntoView === "function") {
                    card.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                const invalid = card.querySelector<HTMLElement>("[aria-invalid='true']");
                (invalid ?? card.querySelector<HTMLElement>("button, input, textarea"))?.focus({
                    preventScroll: true,
                });
            });
        },
        [setOpen]
    );

    /** Tras un guardado con errores: abre todas las tarjetas afectadas y va a la primera. */
    const revealErrors = useCallback(
        (sections: AdminCatalogSectionId[]) => {
            const cards = CARD_ORDER.filter((card) => sections.some((s) => SECTION_CARD[s] === card));
            if (cards.length === 0) return;
            setOpenSet((prev) => new Set([...prev, ...cards]));
            reveal(cards[0] as AdminCatalogCardId);
        },
        [reveal]
    );

    return useMemo(
        () => ({ isOpen, setOpen, reveal, revealErrors }),
        [isOpen, setOpen, reveal, revealErrors]
    );
}
