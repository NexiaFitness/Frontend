import { describe, expect, it } from "vitest";
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
