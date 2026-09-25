/**
 * E2E test data — Credenciales y datos de prueba
 *
 * Responsabilidad: única fuente de verdad para usuario demo y factories.
 * Requisito: cuenta demo con email verificado y perfil trainer completo
 * (ejecutar una vez: cd backend && NEXIA_DEMO_PASSWORD=… python scripts/seed_demo_user.py).
 *
 * Contraseña: solo desde env `NEXIA_DEMO_PASSWORD` (nunca hardcodeada en repo).
 */

export const demoUser = "nexiafitness.demo@gmail.com";

function requireDemoPassword(): string {
  const fromEnv =
    (typeof process !== "undefined" && process.env?.NEXIA_DEMO_PASSWORD) || "";
  const password = String(fromEnv).trim();
  if (!password) {
    throw new Error(
      "E2E: falta NEXIA_DEMO_PASSWORD en el entorno. No uses contraseñas en el código."
    );
  }
  return password;
}

export const demoPassword = requireDemoPassword();

/** Datos mínimos para crear un cliente en E2E (onboarding u otros flujos). */
export function createMinimalClientData() {
  const suffix = Date.now();
  return {
    nombre: "E2E",
    apellidos: `Client ${suffix}`,
    mail: `e2e.${suffix}@example.com`,
  };
}

/** Datos mínimos para crear un plan en E2E. */
export function createMinimalPlanData() {
  return {
    name: `E2E Plan ${Date.now()}`,
    description: "Created by E2E",
  };
}
