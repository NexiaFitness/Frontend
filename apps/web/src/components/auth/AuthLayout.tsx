/**
 * AuthLayout: Layout de autenticación con diseño Sparkle Flow.
 *
 * - Panel izquierdo (marca): visible solo en lg, bg-surface
 * - Panel derecho (formulario): max-w-[400px], glass premium en móvil
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NexiaLogo } from "./NexiaLogo";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    AUTH_CARD_DESKTOP,
    AUTH_CARD_MOBILE,
} from "./authFormPresentation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-[calc(100vh-128px)] flex-col overflow-hidden bg-background lg:flex-row">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 20% 20%, hsl(190 100% 50% / 0.08) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="hidden flex-1 flex-col items-center justify-center bg-surface px-8 py-10 text-center lg:flex">
        <div className="relative z-10 max-w-4xl">
          <div className="mb-2">
            <NexiaLogo className="mx-auto h-auto w-80 sm:w-96 md:w-[28rem] lg:w-[36rem] xl:w-[44rem]" />
          </div>
          <p className="text-base font-medium leading-relaxed text-foreground sm:text-lg md:text-xl lg:text-2xl">
            Revolucionando la creación de programas de entrenamiento para profesionales del fitness
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div
          className={cn(
            "w-full max-w-[400px] p-6 lg:p-8",
            AUTH_CARD_MOBILE,
            AUTH_CARD_DESKTOP
          )}
        >
          <NexiaGlassAccentRim mobileOnly />
          {children}
        </div>
      </div>
    </div>
  );
};
