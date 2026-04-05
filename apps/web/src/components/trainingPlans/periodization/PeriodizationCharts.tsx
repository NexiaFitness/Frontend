import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

interface Props {
  blocks: PlanPeriodBlock[];
  catalog: PhysicalQuality[];
}

type Aggregation = "week" | "month";

const GRID_STROKE = "hsl(240 14% 20%)";
const TICK_FILL = "hsl(240 10% 65%)";
const TOOLTIP_BG = "rgb(25, 25, 36)";
const TOOLTIP_BORDER = "rgb(44, 44, 58)";

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getISOWeek(d: Date): number {
  const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const jan4 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(((tmp.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function getWeekKey(d: Date): string {
  return `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, "0")}`;
}

interface BucketEntry {
  key: string;
  label: string;
  volume: number;
  intensity: number;
  qualityPcts: Record<string, number>;
  blockCount: number;
}

function buildBuckets(blocks: PlanPeriodBlock[], agg: Aggregation, catalog: PhysicalQuality[]): BucketEntry[] {
  if (blocks.length === 0) return [];

  const sorted = [...blocks].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const globalStart = parseLocal(sorted[0].start_date);
  const globalEnd = parseLocal(sorted[sorted.length - 1].end_date);

  const bucketMap = new Map<string, BucketEntry>();

  const cur = new Date(globalStart);
  while (cur <= globalEnd) {
    const key = agg === "week" ? getWeekKey(cur) : getMonthKey(cur);
    if (!bucketMap.has(key)) {
      let label: string;
      if (agg === "week") {
        label = `S${getISOWeek(cur)}`;
      } else {
        label = cur.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
      }
      bucketMap.set(key, { key, label, volume: 0, intensity: 0, qualityPcts: {}, blockCount: 0 });
    }
    if (agg === "week") {
      cur.setDate(cur.getDate() + 7);
    } else {
      cur.setMonth(cur.getMonth() + 1);
      cur.setDate(1);
    }
  }

  for (const block of sorted) {
    const bs = parseLocal(block.start_date);
    const be = parseLocal(block.end_date);
    const visited = new Set<string>();

    const d = new Date(bs);
    while (d <= be) {
      const key = agg === "week" ? getWeekKey(d) : getMonthKey(d);
      if (!visited.has(key)) {
        visited.add(key);
        const bucket = bucketMap.get(key);
        if (bucket) {
          bucket.volume += block.volume_level;
          bucket.intensity += block.intensity_level;
          bucket.blockCount += 1;
          for (const q of block.qualities) {
            const cat = catalog.find((c) => c.id === q.physical_quality_id);
            const slug = cat?.slug ?? q.physical_quality_slug ?? `q${q.physical_quality_id}`;
            bucket.qualityPcts[slug] = (bucket.qualityPcts[slug] ?? 0) + q.percentage;
          }
        }
      }
      d.setDate(d.getDate() + 1);
    }
  }

  const buckets = Array.from(bucketMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  for (const bucket of buckets) {
    if (bucket.blockCount > 0) {
      bucket.volume = Math.round((bucket.volume / bucket.blockCount) * 10) / 10;
      bucket.intensity = Math.round((bucket.intensity / bucket.blockCount) * 10) / 10;
      for (const slug of Object.keys(bucket.qualityPcts)) {
        bucket.qualityPcts[slug] = Math.round(bucket.qualityPcts[slug] / bucket.blockCount);
      }
    }
  }

  return buckets;
}

function buildDateRangeOptions(blocks: PlanPeriodBlock[]): { value: string; label: string }[] {
  if (blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const start = parseLocal(sorted[0].start_date);
  const end = parseLocal(sorted[sorted.length - 1].end_date);

  const options: { value: string; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= endMonth) {
    const val = getMonthKey(cur);
    const label = cur.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    options.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    cur.setMonth(cur.getMonth() + 1);
  }

  options.unshift({ value: "all", label: "Todo el plan" });
  return options;
}

function slugToLabel(slug: string, catalog: PhysicalQuality[]): string {
  const found = catalog.find((c) => c.slug === slug);
  return found?.name ?? slug;
}

export const PeriodizationCharts: React.FC<Props> = ({ blocks, catalog }) => {
  const [aggregation, setAggregation] = useState<Aggregation>("week");
  const [dateRange, setDateRange] = useState("all");

  const dateOptions = useMemo(() => buildDateRangeOptions(blocks), [blocks]);

  const filteredBlocks = useMemo(() => {
    if (dateRange === "all") return blocks;
    const [yStr, mStr] = dateRange.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    const rangeStart = new Date(y, m - 1, 1);
    const rangeEnd = new Date(y, m, 0);
    return blocks.filter((b) => {
      const bs = parseLocal(b.start_date);
      const be = parseLocal(b.end_date);
      return bs <= rangeEnd && be >= rangeStart;
    });
  }, [blocks, dateRange]);

  const buckets = useMemo(
    () => buildBuckets(filteredBlocks, aggregation, catalog),
    [filteredBlocks, aggregation, catalog]
  );

  const volIntData = useMemo(
    () => buckets.map((b) => ({ name: b.label, Volumen: b.volume, Intensidad: b.intensity })),
    [buckets]
  );

  const { qualData, slugs } = useMemo(() => {
    const allSlugs = new Set<string>();
    for (const b of buckets) {
      for (const slug of Object.keys(b.qualityPcts)) allSlugs.add(slug);
    }
    const data = buckets.map((b) => {
      const row: Record<string, string | number> = { name: b.label };
      for (const slug of allSlugs) {
        row[slug] = b.qualityPcts[slug] ?? 0;
      }
      return row;
    });
    return { qualData: data, slugs: Array.from(allSlugs) };
  }, [buckets]);

  if (blocks.length === 0) return null;

  return (
    <div className="rounded-lg bg-surface p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Progresión del plan</h3>
        <div className="flex items-center gap-2">
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as Aggregation)}
            className="rounded-md bg-surface-2 border border-border px-2.5 py-1.5 text-xs text-foreground"
            aria-label="Tipo de agregación"
          >
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md bg-surface-2 border border-border px-2.5 py-1.5 text-xs text-foreground"
            aria-label="Rango de fechas"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Volumen e Intensidad
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volIntData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: TICK_FILL }} stroke="#666" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: TICK_FILL }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: TOOLTIP_BG,
                  border: `1px solid ${TOOLTIP_BORDER}`,
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Volumen" fill="hsl(190 100% 50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Intensidad" fill="hsl(40 100% 50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Cualidades físicas
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={qualData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: TICK_FILL }} stroke="#666" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: TICK_FILL }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: TOOLTIP_BG,
                  border: `1px solid ${TOOLTIP_BORDER}`,
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => slugToLabel(value, catalog)}
              />
              {slugs.map((slug) => (
                <Bar
                  key={slug}
                  dataKey={slug}
                  name={slugToLabel(slug, catalog)}
                  stackId="qualities"
                  fill={getPhysicalQualityColor(slug).hex}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
