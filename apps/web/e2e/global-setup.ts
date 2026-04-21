/**
 * global-setup.ts — Aviso previo a la suite E2E.
 * No arranca ni para servicios. Solo recordatorio visual.
 *
 * Ruta: frontend/apps/web/e2e/global-setup.ts (referenciado desde playwright.config.ts).
 */
async function globalSetup() {
  console.log("[E2E] Asegúrate de que el backend corre con .env.e2e (base nexia_e2e).");
  console.log("[E2E] Para resetear la base: bash backend/scripts/reset_e2e_db.sh (Git Bash o WSL).");
}

export default globalSetup;
