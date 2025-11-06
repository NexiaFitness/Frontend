/**
 * calculations.ts — Funciones de cálculo relacionadas con clientes
 *
 * Contexto:
 * - Contiene lógica matemática auxiliar para datos antropométricos.
 * - Usado principalmente en PhysicalMetrics.tsx y BmiModal.tsx.
 * - No realiza validaciones (eso corresponde a validations/clients).
 *
 * Funciones incluidas:
 * - calculateBMI: devuelve índice de masa corporal redondeado a 1 decimal.
 * - classifyBMI: devuelve categoría en función del valor del IMC.
 *
 * @author Frontend
 * @since v2.2.0
 */

/**
 * Calcula el IMC (Índice de Masa Corporal).
 * Fórmula: peso (kg) / altura² (m²).
 *
 * @param peso - Peso en kilogramos
 * @param altura - Altura en metros
 * @returns número redondeado a un decimal, o 0 si no es válido
 */
export const calculateBMI = (peso: number, altura: number): number => {
    if (!peso || !altura || altura <= 0) return 0;
    const bmi = peso / (altura * altura);
    return Math.round(bmi * 10) / 10;
};

/**
 * Clasifica el IMC en categorías estándar de la OMS.
 *
 * @param bmi - Índice de Masa Corporal
 * @returns string con la categoría
 */
export const classifyBMI = (bmi: number): string => {
    if (bmi <= 0) return "No calculado";
    if (bmi < 18.5) return "Bajo peso";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Sobrepeso";
    return "Obesidad";
};
