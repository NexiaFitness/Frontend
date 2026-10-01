/**
 * errorMessage.spec.ts — Tests de requisito de getMutationErrorMessage (localización de errores de API).
 * Contexto: el backend devuelve `detail` en inglés; la UI solo debe mostrar español.
 * Notas de mantenimiento: al añadir un detail nuevo en el backend, añadir su traducción y su test aquí.
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import { describe, expect, it } from "vitest";
import {
    clearRefreshNetworkFailure,
    noteRefreshNetworkFailure,
    resetApiTelemetryForTests,
} from "../config/apiTelemetry";
import { getMutationErrorMessage } from "./errorMessage";

describe("getMutationErrorMessage — forgot-password 503", () => {
  it("mapea email_delivery_failed al mensaje en español", () => {
    const error = {
      status: 503,
      data: {
        detail: {
          code: "email_delivery_failed",
          message: "No hemos podido enviar el email. Inténtalo de nuevo en unos minutos.",
        },
      },
    };
    expect(getMutationErrorMessage(error)).toBe(
      "No hemos podido enviar el email. Inténtalo de nuevo en unos minutos."
    );
  });

});

describe("getMutationErrorMessage — auth / sesión", () => {
  it("traduce Could not validate credentials", () => {
    expect(
      getMutationErrorMessage({
        status: 401,
        data: { detail: "Could not validate credentials" },
      })
    ).toBe("Tu sesión ha expirado o no tienes permiso. Vuelve a iniciar sesión.");
  });

  it("401 tras fallo de red en refresh", () => {
    resetApiTelemetryForTests();
    noteRefreshNetworkFailure();
    expect(
      getMutationErrorMessage({
        status: 401,
        data: { detail: "Could not validate credentials" },
      })
    ).toBe(
      "Sin conexión estable. No pudimos renovar tu sesión; inténtalo de nuevo cuando tengas red."
    );
    clearRefreshNetworkFailure();
  });
});

describe("getMutationErrorMessage — login y autenticación en español", () => {
  const cases: Array<[string, number, string]> = [
    ["Incorrect email or password", 400, "Correo o contraseña incorrectos"],
    [
      "Account temporarily locked. Please try again later.",
      429,
      "Cuenta bloqueada temporalmente por demasiados intentos. Inténtalo de nuevo más tarde.",
    ],
    [
      "Account is deactivated",
      403,
      "Esta cuenta está desactivada. Contacta con tu entrenador o con soporte.",
    ],
    ["Email already registered", 400, "Este email ya está registrado."],
    ["Current password is incorrect", 400, "La contraseña actual no es correcta."],
    ["Invalid OTP code", 400, "El código no es correcto. Revisa el código e inténtalo de nuevo."],
    ["OTP expired", 400, "El código ha caducado o no existe. Solicita uno nuevo."],
  ];

  it.each(cases)("traduce %s", (detail, status, expected) => {
    expect(getMutationErrorMessage({ status, data: { detail } })).toBe(expected);
  });

  it("el mensaje de credenciales incorrectas es genérico: no revela si falla email o contraseña", () => {
    const message = getMutationErrorMessage({
      status: 400,
      data: { detail: "Incorrect email or password" },
    });
    expect(message.toLowerCase()).toContain("correo");
    expect(message.toLowerCase()).toContain("contraseña");
    expect(message).not.toMatch(/[A-Za-z]{3,} (email|password)/);
  });

  it("no altera detalles desconocidos", () => {
    expect(getMutationErrorMessage({ status: 400, data: { detail: "Texto del servidor" } })).toBe(
      "Texto del servidor"
    );
  });
});
