"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LEVELS } from "@/lib/constants";
import type { CoverageLevel } from "@/types";

const ORDER: CoverageLevel[] = ["high", "medium", "low"];

/** Répartition des tâches par niveau de couverture IA (comptage des valeurs réelles). */
export function CoverageDistribution({ counts }: { counts: Record<CoverageLevel, number> }) {
  const data = ORDER.map((l) => ({ level: l, name: LEVELS[l].label.replace("Couverture ", ""), rule: LEVELS[l].rule, value: counts[l] }));
  return (
    <figure>
      <div className="h-44 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 0 }} barSize={22}>
            <XAxis type="number" hide allowDecimals={false} domain={[0, "dataMax"]} />
            <YAxis type="category" dataKey="name" width={70} axisLine={false} tickLine={false} tick={{ fill: "#1E1F1D", fontSize: 13 }} />
            <Tooltip cursor={{ fill: "#EBF1E6" }} contentStyle={{ borderRadius: 8, border: "1px solid #E3E1D9", background: "#FFFEFA", fontSize: 12 }}
              formatter={(v: number, _n, p) => [`${v} tâche${v > 1 ? "s" : ""}`, p.payload.rule]} labelFormatter={() => ""} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} background={{ fill: "#F5F3ED", radius: 6 }}>
              {data.map((d) => <Cell key={d.level} fill={LEVELS[d.level].color} stroke={d.level === "low" ? "#C4D74A" : undefined} />)}
              <LabelList dataKey="value" position="right" fill="#1E1F1D" fontSize={13} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.name} (${d.rule}) : ${d.value} tâches. `)}
      </figcaption>
    </figure>
  );
}
