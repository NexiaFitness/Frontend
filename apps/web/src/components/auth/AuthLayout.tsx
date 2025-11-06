/**
 * AuthLayout: Layout de autenticación con diseño 50/50 y responsive.
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v4.3.0 - Typography system integration + text-shadow consistency
 */

import React from "react";
import { meshGradient } from "@/utils/backgrounds";
import { TYPOGRAPHY } from "@/utils/typography";
import { NexiaLogo } from "./NexiaLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-[calc(100vh-128px)] flex flex-col lg:flex-row"
      style={{ background: meshGradient }}
    >
      {/* Mitad Izquierda - Logo + Claim */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 text-center">
        <div className="max-w-2xl">
          {/* Logo adaptativo */}
          <div className="mb-6">
            <NexiaLogo className="w-28 sm:w-36 md:w-44 lg:w-80 xl:w-96 h-auto mx-auto" />
          </div>

          {/* Claim adaptativo */}
          <p className={`${TYPOGRAPHY.claim} text-white leading-relaxed [text-shadow:_2px_2px_12px_rgb(0_0_0_/_80%)] lg:[text-shadow:_1px_1px_6px_rgb(0_0_0_/_40%)]`}>
            Revolucionando la creación de programas de entrenamiento para profesionales del fitness
          </p>
        </div>
      </div>

      {/* Mitad Derecha - Formulario */}
      <div
        className="
          flex-1 flex items-center justify-center
          bg-white/20 backdrop-blur-md border border-white/20 shadow-2xl
          px-6 sm:px-8 lg:px-10 py-8 lg:py-12
          rounded-2xl sm:rounded-3xl
          mx-4 sm:mx-8 mb-8 sm:mb-12
          lg:mx-0 lg:mb-0 lg:rounded-none lg:rounded-l-8xl
        "
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};