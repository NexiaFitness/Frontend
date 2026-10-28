/**
 * clientViewScope.ts — Alcance de la ficha de un cliente: entrenador de referencia y
 * si quien la ve puede escribir.
 *
 * Contexto: la pestaña Progreso se usa en dos sitios. En la ficha del entrenador
 * (ClientDetail) el alcance sale del token y se puede escribir. En la vista
 * supervisada del admin (AdminSupervisedClientPage) es de solo lectura y el
 * entrenador viene explícito en la URL (`/admin/users/:userId/clients/:clientId`).
 *
 * Notas de mantenimiento:
 * - Sin proveedor rige el valor por defecto: entrenador, escritura permitida.
 * - El backend sigue siendo la barrera (middleware de supervisión del admin: 422 sin
 *   motivo). Este contexto solo evita ofrecer acciones que fallarían.
 * - trainerId nunca se deduce del rol ni de la lista de entrenadores del cliente: lo
 *   fija quien monta la vista.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { createContext, useContext } from "react";

export interface ClientViewScope {
    /** Entrenador de alcance para listados que el backend exige al admin. */
    trainerId?: number;
    /** true: se ocultan altas, ediciones y registros manuales. */
    readOnly: boolean;
}

const TRAINER_SCOPE: ClientViewScope = { readOnly: false };

export const ClientViewScopeContext = createContext<ClientViewScope>(TRAINER_SCOPE);

export function useClientViewScope(): ClientViewScope {
    return useContext(ClientViewScopeContext);
}
