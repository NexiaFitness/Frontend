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

/** Token tras invite UI: reenvío vía API local (magic_link no se muestra en UI). */
export async function getInvitationTokenAfterUiInvite(
  page: Page,
  email: string,
): Promise<string> {
  return page.evaluate(
    async ({ targetEmail, tokenKey, apiBase }) => {
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        throw new Error("getInvitationTokenAfterUiInvite: no auth token");
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const listResponse = await fetch(
        `${apiBase}/invitations?status=pending&page_size=50`,
        { headers },
      );
      const listBody = await listResponse.json();
      if (!listResponse.ok) {
        throw new Error(
          `list invitations failed (${listResponse.status}): ${JSON.stringify(listBody)}`,
        );
      }
      const invitation = (listBody.items as Array<{ id: number; email: string }>).find(
        (item) => item.email === targetEmail,
      );
      if (!invitation) {
        throw new Error(`No pending invitation for ${targetEmail}`);
      }
      const resendResponse = await fetch(`${apiBase}/invitations/${invitation.id}/resend`, {
        method: "POST",
        headers,
      });
      const resendBody = await resendResponse.json();
      if (!resendResponse.ok) {
        throw new Error(
          `resend invitation failed (${resendResponse.status}): ${JSON.stringify(resendBody)}`,
        );
      }
      const magicLink = resendBody.magic_link as string | undefined;
      if (!magicLink) {
        throw new Error(
          "getInvitationTokenAfterUiInvite: API local debe devolver magic_link (ENVIRONMENT no desplegado)",
        );
      }
      return magicLink.split("token=")[-1];
    },
    { targetEmail: email, tokenKey: TOKEN_KEY, apiBase: API_BASE },
  );
}

export async function inviteClientViaUiAndGetToken(
  page: Page,
  data: Pick<CreateClientApiData, "nombre" | "mail"> & { apellidos?: string },
): Promise<{ token: string; email: string; nombre: string }> {
  await inviteClientViaUi(page, data);
  const token = await getInvitationTokenAfterUiInvite(page, data.mail);
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
