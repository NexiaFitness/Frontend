/**
 * AuthLayout: Layout de autenticación con diseño Sparkle Flow.
 *
 * - Panel izquierdo (marca): visible solo en lg, bg-surface
 * - Panel derecho (formulario): max-w-[400px], bg-background
 * - Sin meshGradient; overlay sutil con primary (hsla(190,100%,50%,0.08))
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v5.0.0 - Nexia Sparkle Flow (Fase 3)
 */

import React from "react";
import { NexiaLogo } from "./NexiaLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[calc(100vh-128px)] flex flex-col lg:flex-row bg-background relative overflow-hidden">
      {/* Overlay sutil primary según audit. style justificado: gradiente radial con posición/forma no expresable con utilidades Tailwind. */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(ellipse 80% 80% at 20% 20%, hsl(190 100% 50% / 0.08) 0%, transparent 60%)" }}
        aria-hidden
      />

      {/* Panel izquierdo - Marca (visible solo lg) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-8 py-10 text-center bg-surface">
        <div className="max-w-4xl relative z-10">
          <div className="mb-2">
            <NexiaLogo className="w-80 sm:w-96 md:w-[28rem] lg:w-[36rem] xl:w-[44rem] h-auto mx-auto" />
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
            Revolucionando la creación de programas de entrenamiento para profesionales del fitness
          </p>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-10 py-8 lg:py-12 relative z-10">
        <div className="w-full max-w-[400px] bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 lg:p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
};