/**
 * admin-cleanup.ts — Borrado de seeds E2E vía admin (solo dev).
 *
 * DELETE /clients/{id} exige rol admin. Usar credenciales desde env local
 * (p. ej. DEMO_ADMIN_* en backend/.env.qa), nunca en el repo.
 */

import type { APIRequestContext } from "@playwright/test";

const API_BASE = process.env.E2E_API_BASE ?? "http://127.0.0.1:8000/api/v1";

export async function deleteClientAsAdmin(
  request: APIRequestContext,
  clientId: number,
): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL ?? process.env.DEMO_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.DEMO_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[E2E cleanup] Omitido delete client",
      clientId,
      "— falta E2E_ADMIN_EMAIL/PASSWORD en env",
    );
    return;
  }

  const login = await request.post(`${API_BASE}/auth/login`, {
    form: { username: email, password },
  });
  if (!login.ok()) {
    console.warn("[E2E cleanup] Admin login failed", login.status());
    return;
  }
  const { access_token: token } = (await login.json()) as { access_token: string };
  const del = await request.delete(`${API_BASE}/clients/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!del.ok()) {
    console.warn("[E2E cleanup] delete client", clientId, del.status(), await del.text());
  }
}
