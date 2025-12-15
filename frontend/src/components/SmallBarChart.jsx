// src/components/SmallBarChart.jsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function SmallBarChart({ data = [], dataKey = "value", nameKey = "name", height = 120 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={nameKey} hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#2962FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
