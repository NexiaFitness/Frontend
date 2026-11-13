/**
 * AdminCatalogErrorSummary.tsx — Resumen de errores al guardar: cuántos y en qué tarjetas.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §3). Con la ficha en tarjetas, un error puede
 * quedar fuera de la vista o dentro de una tarjeta plegada (móvil). El resumen dice cuántos
 * datos faltan y enlaza cada tarjeta: abrirla, bajar hasta ella y poner el foco en el campo.
 * Notas de mantenimiento: Alert sin acción propia (05_ACTION_HIERARCHY §3.1); los enlaces
 * son parte del mensaje.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import {
    CARD_TITLES,
    FICHA_COPY,
    FICHA_SUMMARY_LINK,
    FICHA_SUMMARY_LINKS,
    type AdminCatalogCardId,
} from "./adminCatalogFichaPresentation";
import { CARD_ORDER } from "./useAdminCatalogCards";

export interface AdminCatalogErrorSummaryProps {
    counts: Partial<Record<AdminCatalogCardId, number>>;
    onReveal: (card: AdminCatalogCardId) => void;
}

export const AdminCatalogErrorSummary: React.FC<AdminCatalogErrorSummaryProps> = ({ counts, onReveal }) => {
    const cards = CARD_ORDER.filter((card) => (counts[card] ?? 0) > 0);
    if (cards.length === 0) return null;
    const total = cards.reduce((sum, card) => sum + (counts[card] ?? 0), 0);
    return (
        <Alert variant="error" data-testid="admin-catalog-error-summary">
            <p>{FICHA_COPY.errorSummary(total)}</p>
            <ul className={FICHA_SUMMARY_LINKS}>
                {cards.map((card) => (
                    <li key={card}>
                        <button type="button" className={FICHA_SUMMARY_LINK} onClick={() => onReveal(card)}>
                            {CARD_TITLES[card]}
                        </button>
                    </li>
                ))}
            </ul>
        </Alert>
    );
};
