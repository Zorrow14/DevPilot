"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/src/components/ui/Card";
import type {
  CategoryDatum,
  ReadinessDatum,
  RoadmapProgressDatum,
  SliceDatum,
} from "@/src/lib/analytics";
import { axisProps, chartColors, seriesColors, statusColors, tooltipProps } from "./chartTheme";

type ChartCardProps = {
  title: string;
  hint?: string;
  /** Rendered instead of the chart when there is nothing to plot. */
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
};

/**
 * Every chart shares this frame so the depth is applied once, on the card, and
 * the plots themselves stay flat.
 */
export function ChartCard({ title, hint, isEmpty, emptyMessage, children }: ChartCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          {title}
        </h2>
        {hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
      </div>

      {isEmpty ? (
        <p className="mt-6 text-sm text-ink-dim">{emptyMessage ?? "Nothing to chart yet."}</p>
      ) : (
        // Fixed height: ResponsiveContainer measures its parent, and a flex
        // child with no height would collapse to zero and render nothing.
        <div className="mt-5 h-64 w-full">{children}</div>
      )}
    </Card>
  );
}

export function SkillCategoryChart({ data }: { data: CategoryDatum[] }) {
  return (
    <ChartCard
      title="Skill progress by category"
      hint="Average %"
      isEmpty={data.length === 0}
      emptyMessage="Add skills to see where your effort is going."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey="category" {...axisProps} interval={0} angle={-20} textAnchor="end" height={54} />
          <YAxis domain={[0, 100]} {...axisProps} />
          <Tooltip
            {...tooltipProps}
            // Recharts types value as ValueType | undefined, so the formatter
            // has to cope with a missing point rather than assume a number.
            formatter={(value, _name, item) => [
              `${Number(value ?? 0)}% across ${(item?.payload as CategoryDatum | undefined)?.count ?? 0} skill(s)`,
              "Average progress",
            ]}
          />
          <Bar dataKey="average" fill={chartColors.heading} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function StatusDonut({
  title,
  hint,
  data,
  emptyMessage,
}: {
  title: string;
  hint: string;
  data: SliceDatum[];
  emptyMessage: string;
}) {
  return (
    <ChartCard title={title} hint={hint} isEmpty={data.length === 0} emptyMessage={emptyMessage}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            stroke={chartColors.surface}
            strokeWidth={2}
          >
            {data.map((slice, index) => (
              <Cell
                key={slice.name}
                fill={statusColors[slice.name] ?? seriesColors[index % seriesColors.length]}
              />
            ))}
          </Pie>
          <Tooltip {...tooltipProps} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => <span style={{ color: chartColors.inkDim }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ProjectStatusChart({ data }: { data: SliceDatum[] }) {
  return (
    <StatusDonut
      title="Projects by status"
      hint="Count"
      data={data}
      emptyMessage="Add a project to see its status here."
    />
  );
}

export function TaskStatusChart({ data }: { data: SliceDatum[] }) {
  return (
    <StatusDonut
      title="Tasks by status"
      hint="Count"
      data={data}
      emptyMessage="Add tasks to a project to see completion here."
    />
  );
}

export function ReadinessRadar({ data }: { data: ReadinessDatum[] }) {
  return (
    <ChartCard title="Readiness breakdown" hint="Weighted components">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={chartColors.grid} />
          <PolarAngleAxis dataKey="component" tick={{ fill: chartColors.inkDim, fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke={chartColors.beacon}
            fill={chartColors.beacon}
            fillOpacity={0.22}
          />
          <Tooltip {...tooltipProps} formatter={(value) => [`${Number(value ?? 0)}%`, "Score"]} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryDepthChart({ data }: { data: ReadinessDatum[] }) {
  return (
    <ChartCard title="Core stack depth" hint="Average % per area">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 4, left: 24 }}
        >
          <CartesianGrid stroke={chartColors.grid} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} {...axisProps} />
          <YAxis type="category" dataKey="component" width={84} {...axisProps} />
          <Tooltip {...tooltipProps} formatter={(value) => [`${Number(value ?? 0)}%`, "Average"]} />
          <Bar dataKey="score" fill={chartColors.nominal} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RoadmapProgressChart({ data }: { data: RoadmapProgressDatum[] }) {
  return (
    <ChartCard
      title="Roadmap follow-through"
      hint="Weeks"
      isEmpty={data.length === 0}
      emptyMessage="Generate a roadmap to track weekly progress."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey="name" {...axisProps} interval={0} angle={-20} textAnchor="end" height={54} />
          <YAxis allowDecimals={false} {...axisProps} />
          <Tooltip {...tooltipProps} />
          <Legend
            iconType="circle"
            formatter={(value) => <span style={{ color: chartColors.inkDim }}>{value}</span>}
          />
          {/* Stacked so each bar's full height is the plan length — the gap
              above the mint segment is the work still outstanding. */}
          <Bar dataKey="completed" stackId="weeks" name="Completed" fill={chartColors.nominal} />
          <Bar
            dataKey="remaining"
            stackId="weeks"
            name="Remaining"
            fill={chartColors.inkFaint}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
