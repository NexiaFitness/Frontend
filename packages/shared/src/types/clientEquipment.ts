/**
 * clientEquipment.ts — Tipos para equipo del cliente (inventario personal)
 *
 * Backend: GET/POST /clients/{client_id}/equipment, PUT/DELETE /clients/{client_id}/equipment/{equipment_id}
 * Usado en filtros de ejercicios y alternativas (equipo disponible del cliente).
 *
 * @since v5.x
 */

export interface ClientEquipment {
    id: number;
    client_id: number;
    trainer_id: number;
    name: string;
    quantity: number;
    condition?: string | null;
    is_available: boolean;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface ClientEquipmentCreate {
    name: string;
    quantity?: number;
    condition?: string | null;
    is_available?: boolean;
    notes?: string | null;
}

export interface ClientEquipmentUpdate {
    name?: string;
    quantity?: number;
    condition?: string | null;
    is_available?: boolean;
    notes?: string | null;
}
