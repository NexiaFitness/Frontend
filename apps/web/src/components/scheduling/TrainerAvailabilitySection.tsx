/**
 * TrainerAvailabilitySection.tsx — Sección "Mi Disponibilidad" en sidebar de SchedulingPage
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v8.1.0 — Migrado a design tokens
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect, Checkbox } from "@/components/ui/forms";
import { BaseModal } from "@/components/ui/modals";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import {
    useGetTrainerAvailabilityQuery,
    useCreateTrainerAvailabilityMutation,
    useUpdateTrainerAvailabilityMutation,
    useDeleteTrainerAvailabilityMutation,
} from "@nexia/shared/api/schedulingApi";
import type { TrainerAvailabilityOut } from "@nexia/shared/types/scheduling";

const DAY_NAMES = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
] as const;

const DAY_OPTIONS = DAY_NAMES.map((name, idx) => ({
    value: idx.toString(),
    label: name,
}));

interface TrainerAvailabilitySectionProps {
    trainerId: number;
}

export const TrainerAvailabilitySection: React.FC<TrainerAvailabilitySectionProps> = ({
    trainerId,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const { data: slots = [], isLoading } = useGetTrainerAvailabilityQuery(
        { trainer_id: trainerId, skip: 0, limit: 100 },
        { skip: trainerId <= 0 }
    );

    const [createSlot, { isLoading: isCreating }] = useCreateTrainerAvailabilityMutation();
    const [updateSlot, { isLoading: isUpdating }] = useUpdateTrainerAvailabilityMutation();
    const [deleteSlot, { isLoading: isDeleting }] = useDeleteTrainerAvailabilityMutation();

    const activeSlots = slots.filter((s) => s.is_active);

    const handleCreate = async (values: {
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_recurring: boolean;
    }) => {
        try {
            await createSlot({
                trainer_id: trainerId,
                day_of_week: values.day_of_week,
                start_time: values.start_time,
                end_time: values.end_time,
                is_recurring: values.is_recurring,
            }).unwrap();
            setShowAddForm(false);
        } catch (err) {
            console.error("[TrainerAvailabilitySection] Error creando slot:", err);
        }
    };

    const handleUpdate = async (
        id: number,
        values: Partial<{
            day_of_week: number;
            start_time: string;
            end_time: string;
            is_recurring: boolean;
        }>
    ) => {
        try {
            await updateSlot({ availabilityId: id, data: values }).unwrap();
            setEditingId(null);
        } catch (err) {
            console.error("[TrainerAvailabilitySection] Error actualizando slot:", err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteSlot(id).unwrap();
            setDeleteConfirmId(null);
        } catch (err) {
            console.error("[TrainerAvailabilitySection] Error eliminando slot:", err);
        }
    };

    return (
        <div className="rounded-lg bg-surface border border-border/50 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Mi Disponibilidad
            </h3>

            {isLoading ? (
                <p className="text-sm text-muted-foreground italic">Cargando...</p>
            ) : (
                <>
                    <div className="space-y-3">
                        {activeSlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                                No hay slots de disponibilidad
                            </p>
                        ) : (
                            activeSlots.map((slot) => (
                                <AvailabilitySlotCard
                                    key={slot.id}
                                    slot={slot}
                                    isEditing={editingId === slot.id}
                                    onStartEdit={() => setEditingId(slot.id)}
                                    onCancelEdit={() => setEditingId(null)}
                                    onSave={(values) => handleUpdate(slot.id, values)}
                                    onDeleteClick={() => setDeleteConfirmId(slot.id)}
                                    isSaving={isUpdating}
                                />
                            ))
                        )}
                    </div>

                    {showAddForm ? (
                        <AddSlotForm
                            onCancel={() => setShowAddForm(false)}
                            onSubmit={handleCreate}
                            isLoading={isCreating}
                        />
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddForm(true)}
                            className="w-full mt-4"
                        >
                            + Añadir slot
                        </Button>
                    )}
                </>
            )}

            {deleteConfirmId && (
                <BaseModal
                    isOpen={!!deleteConfirmId}
                    onClose={() => setDeleteConfirmId(null)}
                    title="Eliminar slot"
                    description="¿Estás seguro de que deseas eliminar este slot de disponibilidad?"
                    iconType="danger"
                    isLoading={isDeleting}
                >
                    <div className="flex flex-col md:flex-row gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={isDeleting}
                            size="md"
                            className={BUTTON_PRESETS.modalEqual}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            size="md"
                            className={BUTTON_PRESETS.modalEqual}
                        >
                            Eliminar
                        </Button>
                    </div>
                </BaseModal>
            )}
        </div>
    );
};

interface AvailabilitySlotCardProps {
    slot: TrainerAvailabilityOut;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSave: (values: {
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_recurring: boolean;
    }) => void;
    onDeleteClick: () => void;
    isSaving: boolean;
}

const AvailabilitySlotCard: React.FC<AvailabilitySlotCardProps> = ({
    slot,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onSave,
    onDeleteClick,
    isSaving,
}) => {
    const [dayOfWeek, setDayOfWeek] = useState(slot.day_of_week);
    const [startTime, setStartTime] = useState(slot.start_time);
    const [endTime, setEndTime] = useState(slot.end_time);
    const [isRecurring, setIsRecurring] = useState(slot.is_recurring);

    const dayName = DAY_NAMES[slot.day_of_week] ?? "?";

    if (isEditing) {
        return (
            <div className="border border-border rounded-lg p-3 space-y-3">
                <FormSelect
                    label="Día"
                    value={dayOfWeek.toString()}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                    options={DAY_OPTIONS}
                    size="sm"
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Desde" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} size="sm" />
                    <Input label="Hasta" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} size="sm" />
                </div>
                <Checkbox label="Recurrente (semanal)" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onCancelEdit} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSave({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, is_recurring: isRecurring })}
                        isLoading={isSaving}
                        disabled={isSaving}
                    >
                        Guardar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border/50 rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-colors">
            <div>
                <span className="font-medium text-foreground">{dayName}</span>
                <span className="text-muted-foreground text-sm ml-2">
                    {slot.start_time} – {slot.end_time}
                </span>
                {slot.specific_date && !slot.is_recurring && (
                    <span className="text-xs text-muted-foreground block">{slot.specific_date}</span>
                )}
            </div>
            <div className="flex gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onStartEdit}
                    className="text-muted-foreground hover:text-foreground border-0 shadow-none hover:bg-surface-2"
                >
                    Editar
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteClick}
                    className="text-destructive hover:text-destructive border-0 shadow-none hover:bg-destructive/10"
                >
                    Eliminar
                </Button>
            </div>
        </div>
    );
};

interface AddSlotFormValues {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
}

interface AddSlotFormProps {
    onCancel: () => void;
    onSubmit: (values: AddSlotFormValues) => void;
    isLoading: boolean;
}

const AddSlotForm: React.FC<AddSlotFormProps> = ({ onCancel, onSubmit, isLoading }) => {
    const [dayOfWeek, setDayOfWeek] = useState(0);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("13:00");
    const [isRecurring, setIsRecurring] = useState(true);

    return (
        <div className="border border-border rounded-lg p-3 mt-3 space-y-3">
            <FormSelect
                label="Día"
                value={dayOfWeek.toString()}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                options={DAY_OPTIONS}
                size="sm"
            />
            <div className="grid grid-cols-2 gap-2">
                <Input label="Desde" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} size="sm" />
                <Input label="Hasta" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} size="sm" />
            </div>
            <Checkbox label="Recurrente (semanal)" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSubmit({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, is_recurring: isRecurring })}
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Añadir
                </Button>
            </div>
        </div>
    );
};
