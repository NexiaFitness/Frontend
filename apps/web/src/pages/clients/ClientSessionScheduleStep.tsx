/**
 * Paso 1 — Elegir fecha (plan activo): calendario de periodización + panel lateral.
 * El constructor de sesión vive en la ruta hermana `constructor` (sin apilar debajo).
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { isDateInRange } from "@nexia/shared/utils/periodBlockOverlap";
import { PageTitle } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { ClientActivePlanScheduleLayout } from "@/components/clients/session/ClientActivePlanScheduleLayout";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useClientActivePlanSessionSchedule } from "@/hooks/clients/useClientActivePlanSessionSchedule";

export interface ClientSessionScheduleStepProps {
  clientId: number;
  backPath: string;
}

export const ClientSessionScheduleStep: React.FC<ClientSessionScheduleStepProps> = ({
  clientId,
  backPath,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showWarning } = useToast();
  const pickedDate = searchParams.get("date");

  const {
    activePlanForClient,
    isLoadingActivePlan,
    periodBlocks,
    sessionDatesInPlan,
    exceptionDates,
  } = useClientActivePlanSessionSchedule(clientId);

  const { data: clientProfile } = useGetClientQuery(clientId);

  const [calMonth, setCalMonth] = useState(() => new Date());

  useEffect(() => {
    if (!pickedDate || !/^\d{4}-\d{2}-\d{2}$/.test(pickedDate)) return;
    const d = new Date(`${pickedDate}T12:00:00`);
    if (isNaN(d.getTime())) return;
    setCalMonth((prev) => {
      if (prev.getFullYear() === d.getFullYear() && prev.getMonth() === d.getMonth()) return prev;
      return d;
    });
  }, [pickedDate]);

  const handleDay = useCallback(
    (dateStr: string) => {
      if (!activePlanForClient) return;
      if (!isDateInRange(dateStr, activePlanForClient.start_date, activePlanForClient.end_date)) {
        showWarning("Solo puedes elegir fechas dentro de la vigencia del plan.", 4000);
        return;
      }
      navigate(
        { pathname: "constructor", search: `?date=${encodeURIComponent(dateStr)}` },
        { relative: "path" }
      );
    },
    [activePlanForClient, navigate, showWarning]
  );

  if (isLoadingActivePlan) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!activePlanForClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle
          titleAs="h2"
          title="Elegir día"
          subtitle="Selecciona la fecha en el calendario para abrir el constructor de sesión."
        />
        <Button variant="outline" size="sm" type="button" onClick={() => navigate(backPath)}>
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
          Volver
        </Button>
      </div>

      <ClientActivePlanScheduleLayout
        activePlan={activePlanForClient}
        periodBlocks={periodBlocks}
        sessionDates={sessionDatesInPlan}
        exceptionDates={exceptionDates}
        currentMonth={calMonth}
        onMonthChange={setCalMonth}
        sessionPickerDate={pickedDate}
        onDayClick={handleDay}
        habitualTrainingDays={clientProfile?.training_days ?? null}
      />
    </div>
  );
};
