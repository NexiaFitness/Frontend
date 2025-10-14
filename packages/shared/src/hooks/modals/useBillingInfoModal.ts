/**
 * useBillingInfoModal - Lógica para datos de facturación
 *
 * Contexto:
 * - Validación de NIF/CIF español
 * - Actualización de billing info del trainer
 * - Cross-platform ready
 *
 * @author Frontend Team
 * @since v4.4.0
 */

import { useState } from 'react';
import { useUpdateTrainerProfileMutation } from '../../api/trainerApi';

interface BillingFormData {
    billing_id: string;
    billing_address: string;
    billing_postal_code: string;
}

interface BillingFormErrors {
    billing_id?: string;
    billing_address?: string;
    billing_postal_code?: string;
}

interface BillingInfoModalResult {
    formData: BillingFormData;
    errors: BillingFormErrors;
    isSubmitting: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    validateForm: () => boolean;
    saveBillingInfo: () => Promise<void>;
    resetForm: () => void;
}

const initialFormData: BillingFormData = {
    billing_id: '',
    billing_address: '',
    billing_postal_code: '',
};

// Validación de NIF/CIF español
const validateNIF = (value: string): string | undefined => {
    const nifRegex = /^[0-9]{8}[A-Z]$|^[A-Z][0-9]{8}$/;
    if (!value.trim()) {
        return 'NIF/CIF es obligatorio';
    }
    if (!nifRegex.test(value.trim())) {
        return 'NIF/CIF inválido (formato: 12345678A o A12345678)';
    }
    return undefined;
};

const validateAddress = (value: string): string | undefined => {
    if (!value.trim()) {
        return 'Dirección fiscal es obligatoria';
    }
    if (value.trim().length < 10) {
        return 'Dirección demasiado corta (mínimo 10 caracteres)';
    }
    return undefined;
};

const validatePostalCode = (value: string): string | undefined => {
    if (!value.trim()) {
        return 'Código postal es obligatorio';
    }
    if (value.trim().length < 4 || value.trim().length > 10) {
        return 'Código postal inválido (4-10 dígitos)';
    }
    return undefined;
};

export function useBillingInfoModal(): BillingInfoModalResult {
    const [updateTrainer, { isLoading: isSubmitting }] =
        useUpdateTrainerProfileMutation();

    const [formData, setFormData] = useState<BillingFormData>(initialFormData);
    const [errors, setErrors] = useState<BillingFormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error on change
        if (errors[name as keyof BillingFormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: BillingFormErrors = {};

        const nifError = validateNIF(formData.billing_id);
        if (nifError) newErrors.billing_id = nifError;

        const addressError = validateAddress(formData.billing_address);
        if (addressError) newErrors.billing_address = addressError;

        const postalError = validatePostalCode(formData.billing_postal_code);
        if (postalError) newErrors.billing_postal_code = postalError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveBillingInfo = async (): Promise<void> => {
        if (!validateForm()) {
            throw new Error('Formulario inválido');
        }

        try {
            await updateTrainer({
                billing_id: formData.billing_id.trim(),
                billing_address: formData.billing_address.trim(),
                billing_postal_code: formData.billing_postal_code.trim(),
            }).unwrap();
        } catch (err: any) {
            throw new Error(err?.data?.detail || 'Error al guardar datos de facturación');
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setErrors({});
    };

    return {
        formData,
        errors,
        isSubmitting,
        handleChange,
        validateForm,
        saveBillingInfo,
        resetForm,
    };
}