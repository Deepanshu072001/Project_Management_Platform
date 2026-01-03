// src/components/KpiCard.jsx
import React from "react";
import { Paper, Typography, Box } from "@mui/material";

export default function KpiCard({ title, value, subtitle }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Box display="flex" alignItems="baseline" gap={1}>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
      </Box>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Paper>
  );
}
