/**
 * Exportador central de modales de Clients
 * Incluye DeleteClientModal y futuros modales relacionados con clientes.
 * 
 * Mantener consistencia con auth/modals y account/modals.
 * Así logramos imports limpios:
 *   import { DeleteClientModal } from "@/components/clients/modals";
 * 
 * @author Nelson
 * @since v2.3.0
 */

export { DeleteClientModal } from "./DeleteClientModal";
