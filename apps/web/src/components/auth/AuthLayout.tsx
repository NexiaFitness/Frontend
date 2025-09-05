/**
 * AuthLayout: Layout de autenticación con diseño 50/50
 *
 * - Mitad izquierda: logo y claim principal.
 * - Mitad derecha: card flotante con efecto glassmorphism (transparencia + borde).
 * - Fondo: degradado completo definido en meshGradient.
 *
 * Decisión de diseño:
 * Se combina opacidad moderada (bg-white/20), borde translúcido (border-white/20),
 * y sombra (shadow-2xl) para lograr un card elegante, visible y profesional.
 */

import React from "react";
import { meshGradient } from "@/utils/backgrounds";
import { NexiaLogo } from "./NexiaLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: meshGradient }}
    >
      {/* Mitad Izquierda - Logo + Claim */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <NexiaLogo />
          <div className="mt-6">
            <p className="text-2xl font-medium text-white leading-relaxed">
              Revolucionando la creación de programas de entrenamiento para profesionales del fitness
            </p>
          </div>
        </div>
      </div>

      {/* Mitad Derecha - Card centrado con glassmorphism */}
      <div className="flex-1 flex items-center justify-center bg-white/20 p-8 backdrop-blur-md border border-white/20 rounded-l-8xl shadow-2xl p-8">

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
