/**
 * Punto de entrada público de @nexia/ui-web
 * Re-exporta todos los componentes y estilos disponibles
 *
 * @package @nexia/ui-web
 */

// Re-exportar todos los componentes
export * from "./components";

// Re-exportar utilidades de estilos
export * from "./styles/backgrounds";

// Incluir estilos globales de Tailwind compilados
import "../dist/styles.css";
