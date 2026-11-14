"use client";

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LEVELS, OPPORTUNITY_THRESHOLD, levelFor } from "@/lib/constants";
import type { TaskEvaluation } from "@/types";

const short = (s: string, n = 26) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function TaskCapabilityChart({ evaluations }: { evaluations: TaskEvaluation[] }) {
  const data = evaluations.map((e) => ({ task: e.task, capability: e.capability }));
  return (
    <div className="w-full" style={{ height: Math.max(160, data.length * 38 + 36) }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }} barSize={16}>
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fill: "#85877F", fontSize: 11 }} />
          <YAxis type="category" dataKey="task" width={150} axisLine={false} tickLine={false} tick={{ fill: "#1E1F1D", fontSize: 12 }} tickFormatter={(v: string) => short(v)} />
          <Tooltip cursor={{ fill: "#EBF1E6" }} contentStyle={{ borderRadius: 8, border: "1px solid #E3E1D9", background: "#FFFEFA", fontSize: 12 }} formatter={(v: number) => [`${v} %`, "Capacité IA estimée"]} />
          <ReferenceLine x={OPPORTUNITY_THRESHOLD} stroke="#1E1F1D" strokeDasharray="4 4" label={{ value: `seuil ${OPPORTUNITY_THRESHOLD} %`, position: "top", fill: "#85877F", fontSize: 11 }} />
          <Bar dataKey="capability" radius={[0, 6, 6, 0]} background={{ fill: "#F5F3ED", radius: 6 }}>
            {data.map((d, i) => {
              const level = levelFor(d.capability);
              return <Cell key={i} fill={LEVELS[level].color} stroke={level === "low" ? "#C4D74A" : undefined} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
