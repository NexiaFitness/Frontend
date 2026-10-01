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
