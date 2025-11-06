/**
 * NexiaLogo — Componente de logotipo NEXIA.
 * 
 * Escalable y responsive:
 * - Permite pasar `className` para controlar tamaño y estilos desde fuera.
 * - Fallback seguro si no se pasa ninguna clase.
 *
 * @autor Frontend Team
 * @since v1.0.0
 * @updated v1.1.0 - Soporte para prop className
 */
import React from "react";
import clsx from "clsx";

interface NexiaLogoProps {
  className?: string;
}

export const NexiaLogo: React.FC<NexiaLogoProps> = ({ className }) => {
  return (
    <img
      src="/assets/Logo sin fondo blanco.png"
      alt="NEXIA Fitness"
      className={clsx("mx-auto h-auto", className || "w-96")}
    />
  );
};
