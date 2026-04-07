import React from "react";

import type { PhysicalQuality } from "@nexia/shared/types/planningCargas";

import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

import type { PeriodBlockFormState } from "./usePeriodBlockForm";



interface Props {

  formState: PeriodBlockFormState;

  catalog: PhysicalQuality[];

  qualitiesSum: number;

  overlapDetected: boolean;

  canSubmit: boolean;

  isEditing?: boolean;

  isSubmitting?: boolean;

  onAddQuality: (id: number) => void;

  onRemoveQuality: (id: number) => void;

  onUpdateQualityPct: (id: number, pct: number) => void;

  onVolumeChange: (v: number) => void;

  onIntensityChange: (v: number) => void;

  onSubmit: () => void;

  onReset: () => void;

}



function formatDateShort(dateStr: string): string {

  const d = new Date(dateStr + "T00:00:00");

  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

}



export const PeriodizationPanel: React.FC<Props> = ({

  formState,

  catalog,

  qualitiesSum,

  overlapDetected,

  canSubmit,

  isEditing = false,

  isSubmitting = false,

  onAddQuality,

  onRemoveQuality,

  onUpdateQualityPct,

  onVolumeChange,

  onIntensityChange,

  onSubmit,

  onReset,

}) => {

  const assignedIds = formState.qualities.map((q) => q.physical_quality_id);

  const available = catalog.filter((c) => !assignedIds.includes(c.id));

  const sumColor =

    qualitiesSum === 100 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive";



  if (formState.phase === "idle") {

    return (

      <div className="sticky top-4 rounded-lg bg-surface p-5 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">

        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">

          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>

            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />

          </svg>

        </div>

        <p className="text-sm font-semibold text-foreground">

          {isEditing ? "Editando bloque" : "Crear bloque de periodización"}

        </p>

        <p className="text-xs text-muted-foreground">

          Haz clic en una fecha del calendario para iniciar la selección del rango.

        </p>

      </div>

    );

  }



  return (

    <div className="sticky top-4 rounded-lg bg-surface p-5 space-y-5">

      {/* Range display */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">

          Rango seleccionado

          <span className="ml-0.5 text-destructive font-bold" aria-hidden="true">

            *

          </span>

        </p>

        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">

          <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

            <path strokeLinecap="round" strokeLinejoin="round" d="M4 14a1 1 0 01-.78-1.63l9.9-10.2a.5.5 0 01.86.46l-1.92 6.02A1 1 0 0013 10h7a1 1 0 01.78 1.63l-9.9 10.2a.5.5 0 01-.86-.46l1.92-6.02A1 1 0 0011 14z" />

          </svg>

          <span className="text-sm font-medium">

            {formState.startDate ? formatDateShort(formState.startDate) : "…"}

            {" — "}

            {formState.endDate ? formatDateShort(formState.endDate) : "…"}

          </span>

        </div>

        {formState.phase === "rangeStart" && (

          <p className="mt-2 text-[11px] text-primary animate-pulse">

            Haz clic en el día final para cerrar el rango

          </p>

        )}

      </div>



      {/* Qualities */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">

            Cualidades físicas

            <span className="ml-0.5 text-destructive font-bold" aria-hidden="true">

              *

            </span>

          </p>

          {formState.qualities.length > 0 && (

            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${sumColor}`}>

              {qualitiesSum}%

            </span>

          )}

        </div>

        {formState.qualities.length === 0 && (

          <p className="mt-2 text-[11px] text-primary animate-pulse">

            Añade al menos una cualidad física para continuar

          </p>

        )}



        <div className="space-y-3">

          {formState.qualities.map((q) => {

            const catItem = catalog.find((c) => c.id === q.physical_quality_id);

            const slug = catItem?.slug ?? "unknown";

            const name = catItem?.name ?? `Cualidad #${q.physical_quality_id}`;

            const qColor = getPhysicalQualityColor(slug);



            return (

              <div key={q.physical_quality_id} className="space-y-1.5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span

                      className="h-2 w-2 rounded-full shrink-0"

                      style={{ backgroundColor: qColor.hex }}

                    />

                    <span className="text-xs font-medium">{name}</span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="text-xs font-bold tabular-nums w-8 text-right">

                      {q.percentage}%

                    </span>

                    <button

                      type="button"

                      onClick={() => onRemoveQuality(q.physical_quality_id)}

                      className="text-muted-foreground hover:text-destructive transition-colors"

                      aria-label={`Quitar ${name}`}

                    >

                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />

                      </svg>

                    </button>

                  </div>

                </div>

                <input

                  type="range"

                  min={0}

                  max={100}

                  step={5}

                  value={q.percentage}

                  onChange={(e) => onUpdateQualityPct(q.physical_quality_id, Number(e.target.value))}

                  className="w-full h-1.5 rounded-full appearance-none bg-surface-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:bg-[--thumb-color] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:bg-[--thumb-color]"

                  style={{ "--thumb-color": qColor.hex } as React.CSSProperties}

                  aria-label={`${name} porcentaje`}

                />

              </div>

            );

          })}

        </div>



        {available.length > 0 && (

          <div className="mt-3 flex flex-wrap gap-1.5">

            {available.map((c) => (

              <button

                key={c.id}

                type="button"

                onClick={() => onAddQuality(c.id)}

                className="rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"

              >

                + {c.name}

              </button>

            ))}

          </div>

        )}

      </div>



      {/* Volume */}

      <div>

        <div className="flex items-center justify-between mb-2">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">

            Volumen

          </p>

          <span className="text-sm font-bold text-primary tabular-nums">

            {formState.volumeLevel}/10

          </span>

        </div>

        <input

          type="range"

          min={1}

          max={10}

          value={formState.volumeLevel}

          onChange={(e) => onVolumeChange(Number(e.target.value))}

          className="w-full h-1.5 rounded-full appearance-none bg-surface-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"

          aria-label="Volumen"

        />

        <div className="flex justify-between mt-1">

          <span className="text-[10px] text-muted-foreground">Bajo</span>

          <span className="text-[10px] text-muted-foreground">Alto</span>

        </div>

      </div>



      {/* Intensity */}

      <div>

        <div className="flex items-center justify-between mb-2">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">

            Intensidad

          </p>

          <span className="text-sm font-bold text-warning tabular-nums">

            {formState.intensityLevel}/10

          </span>

        </div>

        <input

          type="range"

          min={1}

          max={10}

          value={formState.intensityLevel}

          onChange={(e) => onIntensityChange(Number(e.target.value))}

          className="w-full h-1.5 rounded-full appearance-none bg-surface-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-warning [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"

          aria-label="Intensidad"

        />

        <div className="flex justify-between mt-1">

          <span className="text-[10px] text-muted-foreground">Bajo</span>

          <span className="text-[10px] text-muted-foreground">Alto</span>

        </div>

      </div>



      {/* Error messages */}

      {overlapDetected && (

        <p className="text-xs text-destructive font-medium">

          El rango seleccionado se solapa con un bloque existente.

        </p>

      )}



      {/* Actions */}

      <div className="flex gap-2 pt-1">

        <button

          type="button"

          onClick={onSubmit}

          disabled={!canSubmit || isSubmitting}

          className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-gradient-to-r from-[hsl(190,100%,45%)] to-[hsl(210,100%,55%)] text-primary-foreground shadow-[0_0_20px_-4px_hsl(190,100%,50%,0.4)] hover:shadow-[0_0_28px_-4px_hsl(190,100%,50%,0.6)] hover:brightness-110 active:brightness-95 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"

        >

          {isSubmitting ? (isEditing ? "Guardando…" : "Creando…") : (isEditing ? "Guardar cambios" : "Crear bloque")}

        </button>

        <button

          type="button"

          onClick={onReset}

          className="inline-flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"

          aria-label="Cancelar selección"

        >

          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />

          </svg>

        </button>

      </div>

    </div>

  );

};

