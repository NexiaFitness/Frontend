/**
 * Exportador central de modales de Account
 * Incluye DeleteAccountModal y futuros modales relacionados con la cuenta.
 * 
 * Mantener consistencia con auth/modals e clients/modals.
 * Así logramos imports limpios:
 *   import { DeleteAccountModal } from "@/components/account/modals";
 * 
 * @author Nelson
 * @since v2.3.0
 */

export { DeleteAccountModal } from "./DeleteAccountModal";
