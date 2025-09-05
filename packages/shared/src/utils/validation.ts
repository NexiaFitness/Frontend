/**
 * Utilidades de validación reutilizables para formularios
 * Extraídas del LoginForm existente y centralizadas
 * Usado en todos los formularios: Auth, Client Onboarding, Training Planning, etc.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

// Constantes de validación
export const EMAIL_REGEX = /\S+@\S+\.\S+/;
export const PASSWORD_MIN_LENGTH = 6;

// Tipos para resultados de validación
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// Validadores individuales reutilizables
export const validateEmail = (email: string): string | undefined => {
    if (!email) {
        return "El correo es obligatorio";
    }
    if (!EMAIL_REGEX.test(email)) {
        return "Introduce un correo válido";
    }
    return undefined;
};

export const validatePassword = (password: string): string | undefined => {
    if (!password) {
        return "La contraseña es obligatoria";
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    }
    return undefined;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
        return "Confirma tu contraseña";
    }
    if (password !== confirmPassword) {
        return "Las contraseñas no coinciden";
    }
    return undefined;
};

export const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value?.trim()) {
        return `${fieldName} es obligatorio`;
    }
    return undefined;
};

export const validateName = (nombre: string): string | undefined => {
    return validateRequired(nombre, "El nombre");
};

export const validateLastName = (apellidos: string): string | undefined => {
    return validateRequired(apellidos, "Los apellidos");
};

// Validadores de formularios específicos
export const validateLoginForm = (formData: { email: string; password: string }): ValidationResult => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

export const validateRegisterForm = (formData: {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    apellidos: string;
}): ValidationResult => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const nombreError = validateName(formData.nombre);
    if (nombreError) errors.nombre = nombreError;

    const apellidosError = validateLastName(formData.apellidos);
    if (apellidosError) errors.apellidos = apellidosError;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

export const validateForgotPasswordForm = (formData: {
    email: string;
}): ValidationResult => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};