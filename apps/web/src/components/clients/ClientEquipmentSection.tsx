/**
 * ClientEquipmentSection.tsx — Sección de equipo del cliente en ClientEdit
 *
 * Lista el inventario de equipo del cliente (material disponible) y permite
 * añadir, editar y eliminar. Usado en filtros de ejercicios/alternativas.
 *
 * @since v5.x (DEC-08)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { BaseModal } from "@/components/ui/modals";
import {
    useGetClientEquipmentQuery,
    useCreateClientEquipmentMutation,
    useUpdateClientEquipmentMutation,
    useDeleteClientEquipmentMutation,
} from "@nexia/shared/api/clientsApi";
import type { ClientEquipment, ClientEquipmentCreate } from "@nexia/shared/types/clientEquipment";

interface ClientEquipmentSectionProps {
    clientId: number;
}

const emptyForm: ClientEquipmentCreate = {
    name: "",
    quantity: 1,
    condition: null,
    is_available: true,
    notes: null,
};

export const ClientEquipmentSection: React.FC<ClientEquipmentSectionProps> = ({ clientId }) => {
    const { data: items = [], isLoading, error } = useGetClientEquipmentQuery(clientId);
    const [createItem, { isLoading: isCreating }] = useCreateClientEquipmentMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateClientEquipmentMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteClientEquipmentMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ClientEquipment | null>(null);
    const [form, setForm] = useState<ClientEquipmentCreate & { id?: number }>(emptyForm);

    const isSubmitting = isCreating || isUpdating;

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (item: ClientEquipment) => {
        setEditing(item);
        setForm({
            name: item.name,
            quantity: item.quantity,
            condition: item.condition ?? null,
            is_available: item.is_available,
            notes: item.notes ?? null,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        try {
            if (editing) {
                await updateItem({
                    clientId,
                    equipmentId: editing.id,
                    data: {
                        name: form.name.trim(),
                        quantity: form.quantity ?? 1,
                        condition: form.condition?.trim() || null,
                        is_available: form.is_available ?? true,
                        notes: form.notes?.trim() || null,
                    },
                }).unwrap();
            } else {
                await createItem({
                    clientId,
                    data: {
                        name: form.name.trim(),
                        quantity: form.quantity ?? 1,
                        condition: form.condition?.trim() || null,
                        is_available: form.is_available ?? true,
                        notes: form.notes?.trim() || null,
                    },
                }).unwrap();
            }
            closeModal();
        } catch (err) {
            console.error("[ClientEquipmentSection] submit error:", err);
        }
    };

    const handleDelete = async (equipmentId: number) => {
        if (!window.confirm("¿Eliminar este equipo de la lista?")) return;
        try {
            await deleteItem({ clientId, equipmentId }).unwrap();
        } catch (err) {
            console.error("[ClientEquipmentSection] delete error:", err);
        }
    };

    if (error) {
        return (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <Alert variant="error">No se pudo cargar el equipo del cliente.</Alert>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Equipo del cliente
                </h3>
                <Button variant="primary" onClick={openCreate} disabled={isLoading}>
                    Añadir equipo
                </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                Material o equipo que tiene disponible el cliente. Se usa para filtrar ejercicios y alternativas.
            </p>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            ) : items.length === 0 ? (
                <p className="text-gray-500 py-4">Aún no hay equipo registrado. Añade el que tenga el cliente.</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded border border-gray-200 bg-gray-50"
                        >
                            <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                {item.quantity > 1 && (
                                    <span className="text-gray-500 ml-2">× {item.quantity}</span>
                                )}
                                {item.condition && (
                                    <span className="text-gray-500 text-sm ml-2">— {item.condition}</span>
                                )}
                                <span
                                    className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                        item.is_available ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    {item.is_available ? "Disponible" : "No disponible"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isDeleting}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal crear/editar */}
            <BaseModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? "Editar equipo" : "Añadir equipo"}
                description={editing ? "Modifica los datos del equipo." : "Añade un equipo o material que tenga el cliente."}
                titleId="client-equipment-modal-title"
                descriptionId="client-equipment-modal-description"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="eq-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            id="eq-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            placeholder="Ej. Mancuernas, Banda elástica"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="eq-quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                        </label>
                        <input
                            id="eq-quantity"
                            type="number"
                            min={1}
                            value={form.quantity ?? 1}
                            onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value, 10) || 1 }))}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="eq-condition" className="block text-sm font-medium text-gray-700 mb-1">
                            Estado (opcional)
                        </label>
                        <input
                            id="eq-condition"
                            type="text"
                            value={form.condition ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value || null }))}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            placeholder="Ej. Bueno, Regular"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="eq-available"
                            type="checkbox"
                            checked={form.is_available ?? true}
                            onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="eq-available" className="text-sm text-gray-700">
                            Disponible para entrenar
                        </label>
                    </div>
                    <div>
                        <label htmlFor="eq-notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notas (opcional)
                        </label>
                        <textarea
                            id="eq-notes"
                            value={form.notes ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {editing ? "Guardar" : "Añadir"}
                        </Button>
                    </div>
                </form>
            </BaseModal>
        </div>
    );
};
