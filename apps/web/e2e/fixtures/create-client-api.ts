/**
 * E2E helper — crear cliente activo vía API (legacy POST /clients).
 * Usar en tests que necesitan ficha de cliente sin flujo invite+accept.
 */

import type { Page } from "@playwright/test";
import { createMinimalClientData } from "./test-data";

const TOKEN_KEY = "nexia_token";
const API_BASE = process.env.E2E_API_BASE ?? "http://127.0.0.1:8000/api/v1";

export interface CreateClientApiData {
  nombre: string;
  apellidos: string;
  mail: string;
}

export async function createClientViaApi(
  page: Page,
  data: CreateClientApiData,
): Promise<number> {
  return page.evaluate(
    async ({ payload, tokenKey, apiBase }) => {
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        throw new Error("createClientViaApi: no auth token in localStorage");
      }
      const response = await fetch(`${apiBase}/clients`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          `createClientViaApi failed (${response.status}): ${JSON.stringify(body)}`,
        );
      }
      return body.id as number;
    },
    { payload: data, tokenKey: TOKEN_KEY, apiBase: API_BASE },
  );
}

export async function createClientAndOpenDetail(
  page: Page,
  data: CreateClientApiData = createMinimalClientData(),
): Promise<{ clientId: number; data: CreateClientApiData }> {
  const clientId = await createClientViaApi(page, data);
  await page.goto(`/dashboard/clients/${clientId}`);
  await page.waitForURL(/\/dashboard\/clients\/\d+/, { timeout: 20_000 });
  return { clientId, data };
}
