/**
 * ClientProgressTab.tsx — Tab Progress del cliente
 *
 * Contexto:
 * - Muestra gráficos de evolución de peso, IMC, intensity, volume
 * - Usa Recharts para visualización
 * - Analytics de tendencias y cambios
 * - Basado en Figma Profile Page V2 (gráficos de línea)
 *
 * Responsabilidades:
 * - Gráficos de progreso físico (peso, IMC)
 * - Gráficos de entrenamiento (intensity, volume)
 * - Métricas de cambio y tendencias
 * - Métricas de carga de entrenamiento (CID, alertas) - V2
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v5.6.0 - Agregado sub-tab "Carga de Entrenamiento" con métricas METRICS
 * @updated v5.6.0 - Fase 3: Migrado a hooks V2 (useWeeklyMetricsV2, useMetricsAlertsV2)
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSubTabNavigation } from "@/hooks/useSubTabNavigation";
import type { ClientProgress, ProgressAnalytics } from "@nexia/shared/types/progress";
import type { Client } from "@nexia/shared/types/client";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { useWeeklyMetricsV2, useMetricsAlertsV2, useMonthlyMetricsV2 } from "@nexia/shared/hooks/metrics";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { CompactChartCard } from "@/components/ui/cards";
import { ProgressForm } from "./ProgressForm";
import { EditProgressModal } from "../modals/EditProgressModal";
import {
    LineChart,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { LegendProps } from "recharts";

// ========================================
// TYPES
// ========================================

interface NormalizedWorkloadDataPoint {
    date: string;
    workload_score: number | null;
    recovery_need_score: number | null;
    workload_score_original?: number | null;
    recovery_need_score_original?: number | null;
}

interface WorkloadTooltipPayloadItem {
    payload?: NormalizedWorkloadDataPoint;
    value?: number;
    name?: string;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Formatea fechas para gráficos de Recharts
 * @param date - Fecha en formato string o number (timestamp)
 * @returns Fecha formateada en formato corto (día/mes)
 */
const formatDate = (date: string | number): string => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${day}/${month}`;  // Formato corto: 20/8
};

// ========================================
// COMPONENT
// ========================================

interface ClientProgressTabProps {
    clientId: number;
    client?: Client | null;
    progressHistory?: ClientProgress[];
    progressAnalytics?: ProgressAnalytics;
}

// Función de comparación personalizada para React.memo
const arePropsEqual = (
    prevProps: ClientProgressTabProps,
    nextProps: ClientProgressTabProps
): boolean => {
    return (
        prevProps.clientId === nextProps.clientId &&
        prevProps.client?.id === nextProps.client?.id &&
        prevProps.client?.updated_at === nextProps.client?.updated_at
    );
};

const ClientProgressTabComponent: React.FC<ClientProgressTabProps> = ({
    clientId,
    client,
}) => {
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ClientProgress | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    
    // Estado para selector de período (semanal/mensual/anual)
    type MetricsPeriod = "weekly" | "monthly" | "annual";
    const [metricsPeriod, setMetricsPeriod] = useState<MetricsPeriod>("weekly");

    // Sub-tab navigation con query parameters
    type ProgressSubTab = "overview" | "load" | "history";
    const { activeSubTab: activeTab, setActiveSubTab: setActiveTab } = useSubTabNavigation<ProgressSubTab>({
        validSubTabs: ["overview", "load", "history"] as const,
        defaultSubTab: "overview",
    });

    const {
        progressHistory,
        weightChartData,
        bmiChartData,
        latestWeight,
        latestBmi,
        weightChange,
        bmiChange,
        trend,
        isLoading: isLoadingProgress,
        error: progressError,
    } = useClientProgress(clientId, client);

    const {
        fatigueChartData,
        energyChartData,
        workloadChartData,
        currentRiskLevel,
        avgPreFatigue,
        avgPostFatigue,
        isLoading: isLoadingFatigue,
    } = useClientFatigue(clientId);

    // Calcular rango de fechas para métricas según período seleccionado
    const metricsDateRange = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (metricsPeriod) {
            case "weekly":
                // Últimas 8 semanas
                startDate.setDate(startDate.getDate() - (8 * 7));
                break;
            case "monthly":
                // Últimos 12 meses
                startDate.setMonth(startDate.getMonth() - 12);
                break;
            case "annual":
                // Últimos 3 años
                startDate.setFullYear(startDate.getFullYear() - 3);
                break;
            default:
                startDate.setDate(startDate.getDate() - (8 * 7));
        }

        return {
            startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
            endDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD
        };
    }, [metricsPeriod]);

    // Hooks V2 de métricas de carga de entrenamiento
    // Obtiene sesiones, las transforma y calcula métricas semanales
    const weeklyMetrics = useWeeklyMetricsV2({
        clientId: clientId,
        startDate: metricsDateRange.startDate,
        endDate: metricsDateRange.endDate,
    });
    
    // Hook V2 para métricas mensuales
    const monthlyMetrics = useMonthlyMetricsV2({
        clientId: clientId,
        startDate: metricsDateRange.startDate,
        endDate: metricsDateRange.endDate,
        w_fase: 1.0,
    });

    // Hook V2 para alertas de métricas (verifica umbrales sobre múltiples días)
    const metricsAlerts = useMetricsAlertsV2({
        clientId: clientId,
        startDate: metricsDateRange.startDate,
        endDate: metricsDateRange.endDate,
        trainerId: client?.trainer_id,
        daily_threshold: 80.0,
        weekly_threshold: 450.0,
        consecutive_threshold: 70.0,
        consecutive_days: 3,
        create_alerts: false, // No crear alertas en BD por ahora
    });

    const isLoading = isLoadingProgress || isLoadingFatigue || 
        (metricsPeriod === "weekly" ? weeklyMetrics.isLoading : monthlyMetrics.isLoading);
    const chartHeight = 400;
    const minChartContainerHeight = 360;
    
    // Memoizar objetos de configuración para evitar recreaciones innecesarias
    const defaultChartMargin = useMemo(() => ({ top: 5, right: 10, left: 30, bottom: 60 }), []);
    const legendConfig: LegendProps = useMemo(() => ({
        align: "left" as const,
        wrapperStyle: { paddingTop: "15px" },
    }), []);

    // Calcular dominios dinámicos para Peso (memoizado para evitar recálculos innecesarios)
    const weightDomain = useMemo(() => {
        if (weightChartData.length === 0) return [0, 150];
        const weights = weightChartData.map(d => d.weight).filter((w): w is number => w !== null && w !== undefined);
        if (weights.length === 0) return [0, 150];
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        return [
            Math.floor(min - 10),
            Math.ceil(max + 10)
        ];
    }, [weightChartData]);

    // Calcular dominios dinámicos para IMC (memoizado para evitar recálculos innecesarios)
    const bmiDomain = useMemo(() => {
        if (bmiChartData.length === 0) return [0, 40];
        const bmis = bmiChartData.map(d => d.bmi).filter((b): b is number => b !== null && b !== undefined);
        if (bmis.length === 0) return [0, 40];
        const min = Math.min(...bmis);
        const max = Math.max(...bmis);
        return [
            Math.floor(min - 2),
            Math.ceil(max + 2)
        ];
    }, [bmiChartData]);

    // Normalizar datos de workload a escala 0-10
    const normalizedWorkloadChartData = useMemo(() => {
        if (!workloadChartData || workloadChartData.length === 0) return [];
        
        // Calcular el máximo histórico de ambos scores
        const allValues = workloadChartData
            .map(d => [d.workload_score, d.recovery_need_score])
            .flat()
            .filter((v): v is number => v !== null && v !== undefined);
        
        if (allValues.length === 0) return [];
        
        const maxValue = Math.max(...allValues);
        
        // Si el máximo es 0, retornar datos sin normalizar
        if (maxValue === 0) return workloadChartData;
        
        // Normalizar cada valor a escala 0-10
        return workloadChartData.map(d => ({
            date: d.date,
            workload_score: d.workload_score !== null && d.workload_score !== undefined
                ? (d.workload_score / maxValue) * 10
                : null,
            recovery_need_score: d.recovery_need_score !== null && d.recovery_need_score !== undefined
                ? (d.recovery_need_score / maxValue) * 10
                : null,
            // Guardar valores originales para el tooltip
            workload_score_original: d.workload_score,
            recovery_need_score_original: d.recovery_need_score,
        }));
    }, [workloadChartData]);

    const hasBodyCompCharts = weightChartData.length > 0 || bmiChartData.length > 0;
    const hasFatigueEnergyCharts =
        fatigueChartData.length > 0 || energyChartData.length > 0;
    const hasWorkloadChart = workloadChartData.length > 0;

    // Verificar si es un error 404 (sin datos) o un error real
    const isNotFoundError: boolean = Boolean(
        progressError &&
        typeof progressError === 'object' &&
        'status' in progressError &&
        progressError.status === 404
    );

    const hasRealError: boolean = Boolean(progressError && !isNotFoundError);

    // Scroll automático cuando se expande el formulario
    useEffect(() => {
        if (showProgressForm && formRef.current) {
            // Pequeño delay para asegurar que el DOM se haya actualizado
            setTimeout(() => {
                formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [showProgressForm]);

    // Handlers para edición (memoizados para evitar recreaciones innecesarias)
    const handleEditClick = useCallback((record: ClientProgress) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setEditModalOpen(false);
        setSelectedRecord(null);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Si hay un error real (no 404), mostrar alerta y no renderizar el resto
    if (hasRealError) {
        return (
            <Alert variant="error">
                Error al cargar datos de progreso. Por favor, intenta de nuevo.
            </Alert>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        Progreso del Cliente
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Evolución de métricas corporales, fatiga, energía y carga de trabajo
                    </p>
                </div>
                <button className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Exportar PDF
                </button>
            </div>

            <nav aria-label="Tabs progreso" className="flex gap-1 border-b border-border">
                {[
                    { id: "overview", label: "Resumen" },
                    { id: "load", label: "Carga de Entrenamiento" },
                    { id: "history", label: "Historial de Registros" },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ProgressSubTab)}
                            className={`relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[140px] text-center ${
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {tab.label}
                            {isActive && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Mensaje de sin datos (404) - solo si no hay datos y no hay error real */}
            {isNotFoundError && (
                <div className="bg-card rounded-lg shadow border border-border p-8 text-center">
                    <p className="text-muted-foreground">
                        Aún no hay datos de progreso para este cliente.
                    </p>
                </div>
            )}

            {activeTab === "overview" && (
                <>
                    {/* Summary Cards - solo mostrar si hay datos */}
                    {!isNotFoundError && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <SummaryCard
                                label="Peso Actual"
                                value={latestWeight ? `${latestWeight} kg` : "N/A"}
                                change={weightChange}
                                trend={trend}
                            />
                            <SummaryCard
                                label="IMC Actual"
                                value={latestBmi ? latestBmi.toFixed(1) : "N/A"}
                                change={bmiChange}
                            />
                            <SummaryCard
                                label="Fatiga Promedio (Pre)"
                                value={avgPreFatigue ? avgPreFatigue.toFixed(1) : "N/A"}
                            />
                            <SummaryCard
                                label="Fatiga Promedio (Post)"
                                value={avgPostFatigue ? avgPostFatigue.toFixed(1) : "N/A"}
                            />
                            <SummaryCard
                                label="Nivel de Riesgo"
                                value={currentRiskLevel || "N/A"}
                                riskLevel={currentRiskLevel}
                            />
                        </div>
                    )}
                </>
            )}

            {activeTab === "load" && (
                <div className="space-y-6">
                    {/* Selector de período (Semanal/Mensual/Anual) */}
                    <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-center gap-2 bg-muted p-1 rounded-lg">
                            {[
                                { id: "weekly" as MetricsPeriod, label: "Semanal" },
                                { id: "monthly" as MetricsPeriod, label: "Mensual" },
                                { id: "annual" as MetricsPeriod, label: "Anual" },
                            ].map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setMetricsPeriod(period.id)}
                                    className={`
                                        px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        ${metricsPeriod === period.id
                                            ? 'bg-card text-primary shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }
                                    `}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Estado de carga para métricas */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Mensaje si no hay datos de CID */}
                    {!isLoading && (metricsPeriod === "weekly" ? weeklyMetrics.items.length === 0 : monthlyMetrics.items.length === 0) && (
                        <div className="bg-card border border-border rounded-lg shadow p-8 text-center">
                            <p className="text-muted-foreground">
                                No hay sesiones de entrenamiento con datos de volumen/intensidad en el rango seleccionado.
                            </p>
                            <p className="text-sm text-muted-foreground/80 mt-2">
                                Las sesiones necesitan tener valores de volumen e intensidad (actuales o planificados) para calcular métricas.
                            </p>
                        </div>
                    )}

                    {/* Vista Semanal */}
                    {metricsPeriod === "weekly" && !isLoading && weeklyMetrics.chartData && weeklyMetrics.chartData.length > 0 && (
                        <CompactChartCard title="CID Semanal">
                            <div
                                className="w-full flex items-center justify-center"
                                style={{ minHeight: `${minChartContainerHeight}px` }}
                            >
                                <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                    <ResponsiveContainer width="100%" height={chartHeight}>
                                        <LineChart data={weeklyMetrics.chartData} margin={defaultChartMargin}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="weekStart" 
                                                tickFormatter={(value) => {
                                                    // value ya es weekStart (ISO date del lunes de la semana)
                                                    const monday = new Date(value);
                                                    const sunday = new Date(monday);
                                                    sunday.setDate(sunday.getDate() + 6);
                                                    
                                                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                                                    return `${monday.getDate()}–${sunday.getDate()} ${monthNames[sunday.getMonth()]}`;
                                                }}
                                                style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                label={{ value: "Semana", position: "insideBottom", offset: -5 }}
                                            />
                                            <YAxis
                                                label={{
                                                    value: "CID",
                                                    angle: -90,
                                                    position: "left",
                                                    offset: -5,
                                                    style: { textAnchor: "middle" },
                                                }}
                                                style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <Tooltip 
                                                labelFormatter={(value) => {
                                                    // value ya es weekStart (ISO date del lunes de la semana)
                                                    const monday = new Date(value);
                                                    const sunday = new Date(monday);
                                                    sunday.setDate(sunday.getDate() + 6);
                                                    
                                                    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                                                    return `Semana del ${monday.getDate()} al ${sunday.getDate()} de ${monthNames[sunday.getMonth()]}, ${sunday.getFullYear()}`;
                                                }}
                                                formatter={(value: number) => [`${value.toFixed(1)}`, "CID"]}
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend {...legendConfig} />
                                            <Line
                                                type="monotone"
                                                dataKey="cid"
                                                stroke="hsl(var(--primary))"
                                                name="CID Total"
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                                isAnimationActive={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="avg"
                                                stroke="hsl(var(--success))"
                                                name="CID Promedio"
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: "hsl(var(--success))" }}
                                                isAnimationActive={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CompactChartCard>
                    )}
                    
                    {/* Vista Mensual */}
                    {metricsPeriod === "monthly" && !isLoading && monthlyMetrics.monthlyMetrics && monthlyMetrics.monthlyMetrics.length > 0 && (() => {
                        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                        const monthlyChartData = monthlyMetrics.monthlyMetrics.map(bucket => ({
                            month: bucket.month,
                            monthName: monthNames[bucket.month - 1] || `M${bucket.month}`,
                            cid: bucket.cid_sum,
                            avg: bucket.cid_avg,
                        }));
                        
                        return (
                            <CompactChartCard title="CID Mensual">
                                <div
                                    className="w-full flex items-center justify-center"
                                    style={{ minHeight: `${minChartContainerHeight}px` }}
                                >
                                    <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                        <ResponsiveContainer width="100%" height={chartHeight}>
                                            <LineChart data={monthlyChartData} margin={defaultChartMargin}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="monthName" 
                                                    style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    label={{ value: "Mes", position: "insideBottom", offset: -5 }}
                                                />
                                                <YAxis
                                                    label={{
                                                        value: "CID",
                                                        angle: -90,
                                                        position: "left",
                                                        offset: -5,
                                                        style: { textAnchor: "middle" },
                                                    }}
                                                    style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                />
                                                <Tooltip 
                                                    labelFormatter={(value, payload) => {
                                                        const data = payload?.[0]?.payload;
                                                        if (!data) return value;
                                                        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                                                        return monthNames[data.month - 1] || value;
                                                    }}
                                                    formatter={(value: number) => [`${value.toFixed(1)}`, "CID"]}
                                                    contentStyle={{ 
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Legend {...legendConfig} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="cid"
                                                    stroke="hsl(var(--primary))"
                                                    name="CID Total"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                                    isAnimationActive={false}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="avg"
                                                    stroke="hsl(var(--success))"
                                                    name="CID Promedio"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "hsl(var(--success))" }}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CompactChartCard>
                        );
                    })()}
                    
                    {/* Vista Anual */}
                    {metricsPeriod === "annual" && !isLoading && monthlyMetrics.monthlyMetrics && monthlyMetrics.monthlyMetrics.length > 0 && (() => {
                        // Agrupar buckets mensuales por año
                        // Necesitamos inferir el año basándonos en el rango de fechas y el mes del bucket
                        const annualDataMap = new Map<number, { cid_sum: number; cid_avg: number; count: number }>();
                        const startDateObj = new Date(metricsDateRange.startDate);
                        const endDateObj = new Date(metricsDateRange.endDate);
                        const currentYear = new Date().getFullYear();
                        
                        monthlyMetrics.monthlyMetrics.forEach(bucket => {
                            // Inferir el año: si el mes es mayor al mes actual, probablemente es del año anterior
                            // Si el mes es menor o igual al mes actual, es del año actual
                            // Pero también consideramos el rango de fechas para ser más precisos
                            let year = currentYear;
                            
                            // Si el rango de fechas abarca múltiples años, necesitamos calcular mejor
                            const startYear = startDateObj.getFullYear();
                            const endYear = endDateObj.getFullYear();
                            
                            if (startYear === endYear) {
                                // Mismo año: todos los buckets son de ese año
                                year = startYear;
                            } else {
                                // Múltiples años: inferir basándose en el mes
                                // Si el mes es mayor al mes de inicio, probablemente es del año de inicio
                                // Si el mes es menor al mes de fin, probablemente es del año de fin
                                const startMonth = startDateObj.getMonth() + 1; // 1-12
                                const endMonth = endDateObj.getMonth() + 1; // 1-12
                                
                                if (bucket.month >= startMonth && bucket.month <= 12) {
                                    year = startYear;
                                } else if (bucket.month >= 1 && bucket.month <= endMonth) {
                                    year = endYear;
                                } else {
                                    // Mes intermedio: usar año más reciente
                                    year = endYear;
                                }
                            }
                            
                            if (!annualDataMap.has(year)) {
                                annualDataMap.set(year, { cid_sum: 0, cid_avg: 0, count: 0 });
                            }
                            
                            const yearData = annualDataMap.get(year)!;
                            yearData.cid_sum += bucket.cid_sum;
                            yearData.cid_avg += bucket.cid_avg;
                            yearData.count += 1;
                        });
                        
                        const annualChartData = Array.from(annualDataMap.entries())
                            .map(([year, data]) => ({
                                year: year.toString(),
                                cid: data.cid_sum,
                                avg: data.count > 0 ? data.cid_avg / data.count : 0,
                            }))
                            .sort((a, b) => parseInt(a.year) - parseInt(b.year));
                        
                        if (annualChartData.length === 0) return null;
                        
                        return (
                            <CompactChartCard title="CID Anual">
                                <div
                                    className="w-full flex items-center justify-center"
                                    style={{ minHeight: `${minChartContainerHeight}px` }}
                                >
                                    <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                        <ResponsiveContainer width="100%" height={chartHeight}>
                                            <LineChart data={annualChartData} margin={defaultChartMargin}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="year" 
                                                    style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    label={{ value: "Año", position: "insideBottom", offset: -5 }}
                                                />
                                                <YAxis
                                                    label={{
                                                        value: "CID",
                                                        angle: -90,
                                                        position: "left",
                                                        offset: -5,
                                                        style: { textAnchor: "middle" },
                                                    }}
                                                    style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                />
                                                <Tooltip 
                                                    labelFormatter={(value) => `Año ${value}`}
                                                    formatter={(value: number) => [`${value.toFixed(1)}`, "CID"]}
                                                    contentStyle={{ 
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Legend {...legendConfig} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="cid"
                                                    stroke="hsl(var(--primary))"
                                                    name="CID Total"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                                    isAnimationActive={false}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="avg"
                                                    stroke="hsl(var(--success))"
                                                    name="CID Promedio"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "hsl(var(--success))" }}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CompactChartCard>
                        );
                    })()}

                    {/* Alertas de Métricas */}
                    {!isLoading && metricsAlerts.hasAlerts && (
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-foreground">Alertas de Carga</h3>
                                {metricsAlerts.hasCritical && (
                                    <span className="px-3 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">
                                        {metricsAlerts.criticalAlerts.length} Crítica{metricsAlerts.criticalAlerts.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {metricsAlerts.activeAlerts.map((alert, index) => {
                                    const severityColors = {
                                        critical: {
                                            bg: "bg-destructive/10",
                                            border: "border-destructive/30",
                                            badge: "bg-destructive/10 text-destructive",
                                            label: "Crítica"
                                        },
                                        high: {
                                            bg: "bg-warning/10",
                                            border: "border-warning/30",
                                            badge: "bg-warning/10 text-warning",
                                            label: "Alta"
                                        },
                                        medium: {
                                            bg: "bg-warning/5",
                                            border: "border-warning/20",
                                            badge: "bg-warning/10 text-warning",
                                            label: "Media"
                                        }
                                    };
                                    const colors = severityColors[alert.severity] || severityColors.medium;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-foreground capitalize">
                                                            {alert.type === "daily_high" ? "CID Diario Alto" : 
                                                             alert.type === "weekly_high" ? "CID Semanal Alto" :
                                                             alert.type === "consecutive_high" ? "Días Consecutivos Altos" :
                                                             alert.type}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                                    {alert.date && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Fecha: {new Date(alert.date).toLocaleDateString('es-ES')}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span>Valor: <strong>{alert.value.toFixed(1)}</strong></span>
                                                        <span>Umbral: <strong>{alert.threshold.toFixed(1)}</strong></span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded font-medium ${colors.badge}`}
                                                >
                                                    {colors.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Cards de métricas agregadas */}
                    {!isLoading && (() => {
                        if (metricsPeriod === "weekly" && weeklyMetrics.chartData && weeklyMetrics.chartData.length > 0) {
                            const latestWeek = weeklyMetrics.chartData[weeklyMetrics.chartData.length - 1];
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SummaryCard
                                        label="CID Semanal Total"
                                        value={latestWeek.cid.toFixed(1)}
                                    />
                                    <SummaryCard
                                        label="CID Promedio Semanal"
                                        value={latestWeek.avg.toFixed(1)}
                                    />
                                    <SummaryCard
                                        label="Sesiones Procesadas"
                                        value={weeklyMetrics.items.length.toString()}
                                    />
                                </div>
                            );
                        }
                        
                        if (metricsPeriod === "monthly" && monthlyMetrics.monthlyMetrics && monthlyMetrics.monthlyMetrics.length > 0) {
                            const latestMonth = monthlyMetrics.monthlyMetrics[monthlyMetrics.monthlyMetrics.length - 1];
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SummaryCard
                                        label="CID Mensual Total"
                                        value={latestMonth.cid_sum.toFixed(1)}
                                    />
                                    <SummaryCard
                                        label="CID Promedio Mensual"
                                        value={latestMonth.cid_avg.toFixed(1)}
                                    />
                                    <SummaryCard
                                        label="Sesiones Procesadas"
                                        value={monthlyMetrics.items.length.toString()}
                                    />
                                </div>
                            );
                        }
                        
                        if (metricsPeriod === "annual" && monthlyMetrics.monthlyMetrics && monthlyMetrics.monthlyMetrics.length > 0) {
                            const totalCid = monthlyMetrics.monthlyMetrics.reduce((sum, bucket) => sum + bucket.cid_sum, 0);
                            const avgCid = monthlyMetrics.monthlyMetrics.reduce((sum, bucket) => sum + bucket.cid_avg, 0) / monthlyMetrics.monthlyMetrics.length;
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SummaryCard
                                        label="CID Anual Total"
                                        value={totalCid.toFixed(1)}
                                    />
                                    <SummaryCard
                                        label="CID Promedio Anual"
                                        value={avgCid.toFixed(1)}
                                    />
                                    <SummaryCard
                                        label="Sesiones Procesadas"
                                        value={monthlyMetrics.items.length.toString()}
                                    />
                                </div>
                            );
                        }
                        
                        return null;
                    })()}

                    {/* Información adicional si hay items pero no hay datos en el gráfico */}
                    {!isLoading && (() => {
                        if (metricsPeriod === "weekly" && weeklyMetrics.items.length > 0 && weeklyMetrics.chartData.length === 0) {
                            return (
                                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                                    <p className="text-sm text-primary">
                                        <strong>Nota:</strong> Se encontraron {weeklyMetrics.items.length} sesión{weeklyMetrics.items.length !== 1 ? 'es' : ''} con datos, 
                                        pero no se pudieron agrupar en semanas. Verifica que las fechas estén dentro del rango seleccionado.
                                    </p>
                                </div>
                            );
                        }
                        
                        if ((metricsPeriod === "monthly" || metricsPeriod === "annual") && monthlyMetrics.items.length > 0 && (!monthlyMetrics.monthlyMetrics || monthlyMetrics.monthlyMetrics.length === 0)) {
                            return (
                                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                                    <p className="text-sm text-primary">
                                        <strong>Nota:</strong> Se encontraron {monthlyMetrics.items.length} sesión{monthlyMetrics.items.length !== 1 ? 'es' : ''} con datos, 
                                        pero no se pudieron agrupar en {metricsPeriod === "monthly" ? "meses" : "años"}. Verifica que las fechas estén dentro del rango seleccionado.
                                    </p>
                                </div>
                            );
                        }
                        
                        return null;
                    })()}
                </div>
            )}

            {activeTab === "history" && !isNotFoundError && progressHistory && progressHistory.length > 0 && (
                <div className="bg-card border border-border rounded-lg shadow px-4 pt-4 pb-4 space-y-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        Historial de Registros
                    </h3>
                    {progressHistory.map((record: ClientProgress) => (
                        <div key={record.id} className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
                            <div className="text-foreground">
                                <p>
                                    <strong>Fecha:</strong>{" "}
                                    {new Date(record.fecha_registro).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Peso:</strong>{" "}
                                    {record.peso ? `${record.peso} kg` : "N/A"} —{" "}
                                    <strong>IMC:</strong>{" "}
                                    {record.imc ? record.imc.toFixed(1) : "N/A"}
                                </p>
                                {record.notas && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        <strong>Notas:</strong> {record.notas}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleEditClick(record)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar registro"
                                aria-label="Editar registro"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "overview" && (
                <>
                    {!isNotFoundError && hasBodyCompCharts && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {weightChartData.length > 0 && (
                                <CompactChartCard title="Evolución del Peso">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={weightChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={weightDomain}
                                                        label={{
                                                            value: "Peso (kg)",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="weight"
                                                        stroke="hsl(var(--primary))"
                                                        name="Peso (kg)"
                                                        strokeWidth={2}
                                                        dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                                        isAnimationActive={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}

                            {bmiChartData.length > 0 && (
                                <CompactChartCard title="Evolución del IMC">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={bmiChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={bmiDomain}
                                                        label={{
                                                            value: "IMC",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="bmi"
                                                        stroke="hsl(var(--primary))"
                                                        name="IMC"
                                                        strokeWidth={2}
                                                        dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                                        isAnimationActive={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}
                        </div>
                    )}

                    {!isNotFoundError && hasFatigueEnergyCharts && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {fatigueChartData.length > 0 && (
                                <CompactChartCard title="Análisis de Fatiga">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <ComposedChart data={fatigueChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        ticks={[0, 2, 4, 6, 8, 10]}
                                                        label={{
                                                            value: "Nivel de Fatiga (0-10)",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pre_fatigue"
                                                        stroke="hsl(var(--primary))"
                                                        fill="hsl(var(--primary))"
                                                        fillOpacity={0.08}
                                                        strokeWidth={2}
                                                        name="Fatiga Pre-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="post_fatigue"
                                                        stroke="hsl(var(--destructive))"
                                                        fill="hsl(var(--destructive))"
                                                        fillOpacity={0.06}
                                                        strokeWidth={2}
                                                        name="Fatiga Post-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}

                            {energyChartData.length > 0 && (
                                <CompactChartCard title="Niveles de Energía">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <ComposedChart data={energyChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        ticks={[0, 2, 4, 6, 8, 10]}
                                                        label={{
                                                            value: "Nivel de Energía (0-10)",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pre_energy"
                                                        stroke="hsl(var(--primary))"
                                                        fill="hsl(var(--primary))"
                                                        fillOpacity={0.08}
                                                        strokeWidth={2}
                                                        name="Energía Pre-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="post_energy"
                                                        stroke="hsl(var(--destructive))"
                                                        fill="hsl(var(--destructive))"
                                                        fillOpacity={0.06}
                                                        strokeWidth={2}
                                                        name="Energía Post-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}
                        </div>
                    )}

                    {!isNotFoundError && hasWorkloadChart && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CompactChartCard title="Carga de Trabajo y Recuperación" className="lg:col-span-2">
                                <div
                                    className="w-full flex items-center justify-center"
                                    style={{ minHeight: `${minChartContainerHeight}px` }}
                                >
                                    <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                        <ResponsiveContainer width="100%" height={chartHeight}>
                                            <ComposedChart data={normalizedWorkloadChartData} margin={defaultChartMargin}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={formatDate}
                                                    style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                    label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                />
                                                <YAxis
                                                    domain={[0, 10]}
                                                    label={{
                                                        value: "Índice de Carga (0-10)",
                                                        angle: -90,
                                                        position: "left",
                                                        offset: -5,
                                                        style: { textAnchor: "middle" },
                                                    }}
                                                    style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                                                />
                                                <Tooltip 
                                                    labelFormatter={formatDate}
                                                    contentStyle={{ 
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    formatter={(value: number, name: string, props?: WorkloadTooltipPayloadItem) => {
                                                        if (!props?.payload) {
                                                            return [`${value.toFixed(1)}/10`, name];
                                                        }
                                                        
                                                        const payload = props.payload;
                                                        const originalValue = name === "Carga de Trabajo" 
                                                            ? payload.workload_score_original
                                                            : payload.recovery_need_score_original;
                                                        
                                                        return [
                                                            `${value.toFixed(1)}/10 (${originalValue?.toFixed(1) ?? 'N/A'})`,
                                                            name
                                                        ];
                                                    }}
                                                />
                                                <Legend {...legendConfig} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="workload_score"
                                                    stroke="hsl(var(--primary))"
                                                    fill="hsl(var(--primary))"
                                                    fillOpacity={0.08}
                                                    strokeWidth={2}
                                                    name="Carga de Trabajo"
                                                    isAnimationActive={false}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="recovery_need_score"
                                                    stroke="hsl(var(--destructive))"
                                                    fill="hsl(var(--destructive))"
                                                    fillOpacity={0.06}
                                                    strokeWidth={2}
                                                    name="Necesidad de Recuperación"
                                                    isAnimationActive={false}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CompactChartCard>
                        </div>
                    )}
                </>
            )}

            {/* Empty state - solo si no es 404 y no hay datos en los gráficos */}
            {!isNotFoundError && weightChartData.length === 0 && bmiChartData.length === 0 && (
                <div className="bg-card rounded-lg shadow border border-border p-8 text-center">
                    <p className="text-muted-foreground">
                        No hay datos de progreso disponibles para este cliente.
                    </p>
                </div>
            )}

            {/* Sección colapsable para agregar nuevo registro */}
            <div className="mt-8" ref={formRef}>
                <button
                    type="button"
                    onClick={() => setShowProgressForm(!showProgressForm)}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-lg shadow p-4 hover:bg-muted transition-colors"
                >
                    <h3 className="text-lg font-semibold text-foreground">
                        {showProgressForm ? "➖" : "➕"} Añadir nuevo registro de progreso
                    </h3>
                    <span className="text-muted-foreground text-sm">
                        {showProgressForm ? "Ocultar" : "Mostrar"}
                    </span>
                </button>
                {showProgressForm && (
                    <div className="mt-4">
                        <ProgressForm clientId={clientId} />
                    </div>
                )}
            </div>

            {/* Modal de edición */}
            {selectedRecord && (
                <EditProgressModal
                    isOpen={editModalOpen}
                    onClose={handleCloseModal}
                    progressRecord={selectedRecord}
                    clientId={clientId}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
};

// Exportar componente memoizado para evitar re-renders innecesarios
export const ClientProgressTab = React.memo(ClientProgressTabComponent, arePropsEqual);

// ========================================
// HELPER COMPONENTS
// ========================================

interface SummaryCardProps {
    label: string;
    value: string;
    change?: number | null;
    trend?: string | null;
    riskLevel?: string | null;
}

const SummaryCardComponent: React.FC<SummaryCardProps> = ({
    label,
    value,
    change,
    trend,
    riskLevel,
}) => {
    const themeMap: Record<string, { bg: string; border: string; text: string }> = {
        "Peso Actual": { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
        "IMC Actual": { bg: "bg-success/10", border: "border-success/30", text: "text-success" },
        "Fatiga Promedio (Pre)": { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning" },
        "Fatiga Promedio (Post)": { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
        "Nivel de Riesgo": { bg: "bg-destructive/10", border: "border-destructive/30", text: riskLevel === "low" ? "text-success" : riskLevel === "medium" ? "text-warning" : "text-destructive" },
    };

    const theme = themeMap[label] || { bg: "bg-muted", border: "border-border", text: "text-foreground" };

    return (
        <div className={`rounded-lg border ${theme.bg} ${theme.border} p-4 min-h-[136px] flex flex-col gap-1`}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${theme.text}`}>{value}</p>
            {change !== null && change !== undefined && (
                <p className={`text-sm mt-1 font-semibold ${change >= 0 ? "text-success" : "text-destructive"}`}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}
                </p>
            )}
            {trend && (
                <p className="text-xs text-muted-foreground mt-1">
                    Tendencia: {trend}
                </p>
            )}
        </div>
    );
};

// Memoizar SummaryCard para evitar re-renders innecesarios
const SummaryCard = React.memo(SummaryCardComponent);