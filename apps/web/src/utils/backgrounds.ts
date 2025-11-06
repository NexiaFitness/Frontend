/**
 * Definiciones de fondos y gradientes reutilizables para UI Web
 * Contiene el mesh gradient principal de NEXIA y otros backgrounds
 * Optimizado para consistencia visual en toda la aplicación
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

/**
 * Mesh gradient principal de NEXIA
 * Combina múltiples radial-gradients para crear efecto orgánico
 * Colores: turquesa, azul, rosa sutil - optimizado para accesibilidad
 */
export const meshGradient = `
    radial-gradient(130% 130% at 0% 100%, #56E0DB 0%, rgba(86,224,219,0) 80%),
    radial-gradient(120% 120% at 100% 150%, #0a8bdcff 0%, rgba(93,174,224,0) 85%),
    radial-gradient(50% 50% at 0% 0%, #94E3DF 0%, rgba(148,227,223,0) 75%),
    radial-gradient(200% 400% at 100% 0%, #FFECE3 0%, rgba(255,236,227,0) 90%),
    radial-gradient(150% 150% at 60% 30%, #7ECFDE 0%, rgba(126,207,222,0) 80%),
    #F0F4F5
`;

/**
 * Mesh gradient invertido de NEXIA
 * Mismos colores pero con la parte clara abajo en lugar de arriba-derecha
 */
export const meshGradientInverted = `
    radial-gradient(130% 130% at 100% 0%, #56E0DB 0%, rgba(86,224,219,0) 80%),
    radial-gradient(120% 120% at 0% -50%, #0a8bdcff 0%, rgba(93,174,224,0) 85%),
    radial-gradient(50% 50% at 100% 100%, #94E3DF 0%, rgba(148,227,223,0) 75%),
    radial-gradient(200% 400% at 0% 100%, #FFECE3 0%, rgba(255,236,227,0) 90%),
    radial-gradient(150% 150% at 40% 70%, #7ECFDE 0%, rgba(126,207,222,0) 80%),
    #F0F4F5
`;