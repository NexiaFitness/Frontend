/**
 * NexiaLogo — Componente de logotipo NEXIA.
 *
 * Escalable y responsive. Usa cn() para consistencia con tokens.
 * En tema oscuro el logo debe tener contraste adecuado (img con filter si necesario).
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v5.0.0 - Nexia Sparkle Flow (Fase 3)
 */
import React from "react";
import { cn } from "@/lib/utils";

interface NexiaLogoProps {
  className?: string;
}

export const NexiaLogo: React.FC<NexiaLogoProps> = ({ className }) => {
  return (
    <img
      src="/NEXIA-2.png"
      alt="NEXIA Fitness"
      className={cn("mx-auto h-auto", className || "w-96")}
    />
  );
};
