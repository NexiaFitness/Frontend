/**
 * AthleteDashboard.tsx — Inicio atleta (V01).
 * Contexto: portal atleta F0, datos reales RTK Query.
 * Contratos: agent.md, DESIGN_MOBILE §7.1, 09_UX V01
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { SessionTodayCard } from "@/components/athlete/SessionTodayCard";
import { WeekStrip } from "@/components/athlete/WeekStrip";
import { MetricCard } from "@/components/ui/cards";
import { Alert } from "@/components/ui/feedback";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { useAthleteDashboard } from "@/hooks/athlete/useAthleteDashboard";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { CalendarDays } from "lucide-react";

export const AthleteDashboard: React.FC = () => {
    const navigate = useNavigate();
    const {
        userName,
        todaySession,
        nextSession,
        weekStrip,
        adherencePercent,
        planProgressPercent,
        hasActivePlan,
        isLoading,
        isError,
        isRestDay,
    } = useAthleteDashboard();

    const handleStart = (sessionId: number) => {
        navigate(`/dashboard/sessions/${sessionId}`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-4 px-4 pb-24 pt-4 lg:pb-8 lg:px-8">
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar tu entrenamiento</p>
                    <p className="mt-1 text-muted-foreground">Comprueba tu conexión e inténtalo de nuevo.</p>
                </Alert>
            </div>
        );
    }

    const showStickyCta = Boolean(todaySession && hasActivePlan);

    return (
        <>
            <div
                className={`space-y-6 px-4 pt-4 lg:px-8 lg:pb-8 ${showStickyCta ? "" : "pb-24"}`}
            >
                <header className="space-y-1">
                    <h1 className="text-xl font-bold text-foreground">Hola, {userName}</h1>
                    <p className="text-sm text-muted-foreground">
                        {todaySession ? "Sesión de hoy" : "Tu entrenamiento"}
                    </p>
                </header>

                <SessionTodayCard
                    session={todaySession}
                    nextSession={nextSession}
                    planProgressPercent={planProgressPercent}
                    isRestDay={isRestDay}
                    hasActivePlan={hasActivePlan}
                    onStart={handleStart}
                />

                {weekStrip.some((d) => d.sessions.length > 0) && <WeekStrip days={weekStrip} />}

                <section aria-label="Tu entrenamiento">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Tu entrenamiento</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard
                            title="Adherencia"
                            value={
                                adherencePercent != null
                                    ? `${Math.round(adherencePercent)}%`
                                    : "—"
                            }
                            subtitle="Esta semana"
                            color="green"
                        />
                        <MetricCard
                            title="Plan"
                            value={
                                planProgressPercent != null
                                    ? `${Math.round(planProgressPercent)}%`
                                    : "—"
                            }
                            subtitle="Cumplimiento anual"
                            color="blue"
                        />
                    </div>
                </section>

                {!hasActivePlan && (
                    <EmptyState
                        icon={<CalendarDays />}
                        title="Sin plan activo"
                        description="Cuando tu entrenador publique tu plan, lo verás aquí."
                        action={
                            <Button
                                variant="secondary"
                                className="min-h-touch-athlete"
                                onClick={() => navigate("/dashboard/account")}
                            >
                                Ver mi cuenta
                            </Button>
                        }
                    />
                )}
            </div>

            {showStickyCta && todaySession && (
                <div className="lg:hidden">
                    <AthleteFixedFooter size="single">
                        <Button
                            variant="primary"
                            className="min-h-touch-athlete w-full"
                            onClick={() => handleStart(todaySession.id)}
                        >
                            Empezar sesión
                        </Button>
                    </AthleteFixedFooter>
                </div>
            )}
        </>
    );
};
