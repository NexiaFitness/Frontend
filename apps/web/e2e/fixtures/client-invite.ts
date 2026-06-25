/**
 * E2E helper — invitar atleta desde la UI o API.
 */

import { expect, type Page } from "@playwright/test";
import { getAddClientFromListButton, navigateToClients } from "./navigation";
import type { CreateClientApiData } from "./create-client-api";

const TOKEN_KEY = "nexia_token";
const API_BASE = process.env.E2E_API_BASE ?? "http://127.0.0.1:8000/api/v1";

export interface InvitationApiResult {
  token: string;
  email: string;
  nombre: string;
  magicLink: string;
}

export async function openClientInvitePage(page: Page): Promise<void> {
  if (!page.url().includes("/dashboard/clients")) {
    await navigateToClients(page);
  }
  await getAddClientFromListButton(page).click();
  await expect(page).toHaveURL(/\/dashboard\/clients\/invite/, {
    timeout: 10_000,
  });
}

export async function inviteClientViaUi(
  page: Page,
  data: Pick<CreateClientApiData, "nombre" | "mail"> & { apellidos?: string },
): Promise<void> {
  await openClientInvitePage(page);

  await page.getByLabel(/^nombre/i).fill(data.nombre);
  if (data.apellidos) {
    await page.getByLabel(/^apellidos/i).fill(data.apellidos);
  }
  await page.getByLabel(/correo electrónico/i).fill(data.mail);
  await page.getByRole("button", { name: /enviar invitación/i }).click();

  await expect(page.getByRole("heading", { name: /invitación enviada/i })).toBeVisible({
    timeout: 15_000,
  });
}

/** Tras inviteClientViaUi, extrae token del enlace dev (solo non-production). */
export async function getDevMagicLinkFromInviteSuccess(
  page: Page,
): Promise<string> {
  const devBlock = page.getByText(/enlace dev:/i);
  await expect(devBlock).toBeVisible({ timeout: 10_000 });
  const text = (await devBlock.textContent()) ?? "";
  const match = text.match(/token=([^\s]+)/);
  if (!match?.[1]) {
    throw new Error(`No se encontró token en enlace dev: ${text}`);
  }
  return decodeURIComponent(match[1]);
}

export async function inviteClientViaUiAndGetToken(
  page: Page,
  data: Pick<CreateClientApiData, "nombre" | "mail"> & { apellidos?: string },
): Promise<{ token: string; email: string; nombre: string }> {
  await inviteClientViaUi(page, data);
  const token = await getDevMagicLinkFromInviteSuccess(page);
  return { token, email: data.mail, nombre: data.nombre };
}

export async function createInvitationViaApi(
  page: Page,
  data: Pick<CreateClientApiData, "nombre" | "mail"> & { apellidos?: string },
): Promise<InvitationApiResult> {
  return page.evaluate(
    async ({ payload, tokenKey, apiBase }) => {
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        throw new Error("createInvitationViaApi: no auth token in localStorage");
      }
      const response = await fetch(`${apiBase}/invitations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: payload.nombre,
          apellidos: payload.apellidos ?? "",
          email: payload.mail,
          acknowledge_transfer: false,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          `createInvitationViaApi failed (${response.status}): ${JSON.stringify(body)}`,
        );
      }
      const magicLink = body.magic_link as string;
      if (!magicLink) {
        throw new Error("createInvitationViaApi: missing magic_link in response");
      }
      const invitationToken = magicLink.split("token=")[-1];
      return {
        token: invitationToken,
        email: payload.mail,
        nombre: payload.nombre,
        magicLink,
      };
    },
    {
      payload: {
        nombre: data.nombre,
        apellidos: data.apellidos ?? "",
        mail: data.mail,
      },
      tokenKey: TOKEN_KEY,
      apiBase: API_BASE,
    },
  );
}
