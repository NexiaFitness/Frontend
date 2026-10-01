/**
 * PwaUpdateBannerHost.test.tsx — Banner visible fuera de /run y oculto en guiado.
 * @author Frontend Team
 * @since v5.x
 */

import type { Dispatch, SetStateAction } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PwaUpdateBannerHost } from "../PwaUpdateBannerHost";
import {
  resetUseRegisterSWMock,
  setUseRegisterSWMock,
} from "@/test-utils/mocks/pwaRegisterReact";
import { setMockLocation } from "@/test-utils/mocks/reactRouterMocks";
import { PWA_UPDATE_BANNER_MESSAGE } from "../pwaUpdateBannerPresentation";

function renderHost(initialPath: string): void {
  setMockLocation(initialPath);
  render(<PwaUpdateBannerHost />);
}

describe("PwaUpdateBannerHost", () => {
  beforeEach(() => {
    setUseRegisterSWMock(() => {
      const needRefresh: [boolean, Dispatch<SetStateAction<boolean>>] = [true, vi.fn()];
      const offlineReady: [boolean, Dispatch<SetStateAction<boolean>>] = [false, vi.fn()];
      const updateServiceWorker = vi.fn(async () => undefined);
      return { needRefresh, offlineReady, updateServiceWorker };
    });
  });

  afterEach(() => {
    resetUseRegisterSWMock();
  });

  it("muestra el banner en dashboard", () => {
    renderHost("/dashboard");
    expect(screen.getByText(PWA_UPDATE_BANNER_MESSAGE)).toBeInTheDocument();
  });

  it("no muestra el banner en la ruta de ejecución", () => {
    renderHost("/dashboard/sessions/9/run");
    expect(screen.queryByText(PWA_UPDATE_BANNER_MESSAGE)).not.toBeInTheDocument();
  });

  it("llama a updateServiceWorker al pulsar Actualizar", async () => {
    const user = userEvent.setup();
    const updateMock = vi.fn(async () => undefined);
    setUseRegisterSWMock(() => {
      const needRefresh: [boolean, Dispatch<SetStateAction<boolean>>] = [true, vi.fn()];
      const offlineReady: [boolean, Dispatch<SetStateAction<boolean>>] = [false, vi.fn()];
      return { needRefresh, offlineReady, updateServiceWorker: updateMock };
    });

    renderHost("/dashboard");
    await user.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(updateMock).toHaveBeenCalledWith(true);
  });
});
