/**
 * BillingInfoModal - Modal para completar datos de facturación
 *
 * Contexto:
 * - Aparece cuando trainer intenta emitir primera factura sin billing info
 * - Valida NIF/CIF, dirección fiscal y código postal
 * - Actualiza trainer profile con datos de facturación
 *
 * Trigger: Intento de emitir factura con billing info incompleto (FUTURO)
 *
 * @author Frontend Team
 * @since v4.4.0
 */

import React from 'react';
import { BaseModal } from '@/components/ui/modals';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/forms';
import { useBillingInfoModal } from '@nexia/shared';

interface BillingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const BillingInfoModal: React.FC<BillingInfoModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleChange,
        saveBillingInfo,
        resetForm,
    } = useBillingInfoModal();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await saveBillingInfo();
            resetForm();
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            // Error ya manejado en hook
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            console.error('[BillingInfoModal] Error:', errorMessage);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Datos de facturación"
            description="Completa tus datos fiscales para emitir facturas legalmente válidas."
            iconType="info"
            titleId="billing-info-modal-title"
            descriptionId="billing-info-modal-description"
            isLoading={isSubmitting}
            closeOnBackdrop={!isSubmitting}
            closeOnEsc={!isSubmitting}
        >
            <form onSubmit={handleSubmit}>
                {/* NIF/CIF */}
                <div className="mb-4">
                    <Input
                        type="text"
                        label="NIF/CIF"
                        name="billing_id"
                        value={formData.billing_id}
                        onChange={handleChange}
                        error={errors.billing_id}
                        required
                        disabled={isSubmitting}
                        placeholder="12345678A o A12345678"
                    />
                </div>

                {/* Dirección fiscal */}
                <div className="mb-4">
                    <Input
                        type="text"
                        label="Dirección fiscal"
                        name="billing_address"
                        value={formData.billing_address}
                        onChange={handleChange}
                        error={errors.billing_address}
                        required
                        disabled={isSubmitting}
                        placeholder="Calle, número, piso"
                    />
                </div>

                {/* Código postal */}
                <div className="mb-6">
                    <Input
                        type="text"
                        label="Código postal"
                        name="billing_postal_code"
                        value={formData.billing_postal_code}
                        onChange={handleChange}
                        error={errors.billing_postal_code}
                        required
                        disabled={isSubmitting}
                        placeholder="28001"
                    />
                </div>

                {/* Info note */}
                <div className="mb-6 sm:mb-8 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800">
                        ℹ️ Estos datos aparecerán en tus facturas emitidas y se podrán
                        editar posteriormente en tu cuenta.
                    </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full sm:w-1/2"
                    >
                        Guardar y continuar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-full sm:w-1/2"
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};