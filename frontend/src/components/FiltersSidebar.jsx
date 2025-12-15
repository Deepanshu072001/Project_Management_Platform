// src/components/FiltersSidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAnalyticsFilters } from "../context/AnalyticsFiltersContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../api/projects";

export default function FiltersSidebar({ open, onClose }) {
  const { filters, setFilters, resetFilters } = useAnalyticsFilters();
  const [local, setLocal] = useState(filters);

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const projects = useMemo(() => projectsData?.data || [], [projectsData]);

  useEffect(() => setLocal(filters), [filters]);

  const apply = () => {
    const updated = { ...local, projectIds: local.projectIds.filter(Boolean) };
    setFilters(updated);
    onClose?.();
  };

  const clear = () => {
    resetFilters();
    setLocal({
      projectIds: [],
      status: "",
      priority: "",
      user: "",
      dateFrom: "",
      dateTo: "",
    });
    onClose?.();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        {/* Projects */}
        <Box mt={2}>
          <Typography variant="caption">Projects</Typography>
          <TextField
            select
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: (selected) => (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selected.map((id) => {
                    const p = projects.find((x) => x._id === id);
                    return <Chip key={id} label={p?.name || id} size="small" />;
                  })}
                </Box>
              ),
            }}
            value={local.projectIds}
            onChange={(e) =>
              setLocal((s) => ({
                ...s,
                projectIds: typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value,
              }))
            }
          >
            {projects.map((p) => (
              <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Status */}
        <Box mt={2}>
          <Typography variant="caption">Status</Typography>
          <TextField
            select fullWidth size="small"
            value={local.status}
            onChange={(e) => setLocal((s) => ({ ...s, status: e.target.value }))}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>
        </Box>

        {/* Priority */}
        <Box mt={2}>
          <Typography variant="caption">Priority</Typography>
          <TextField
            select fullWidth size="small"
            value={local.priority}
            onChange={(e) => setLocal((s) => ({ ...s, priority: e.target.value }))}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
        </Box>

        {/* User */}
        <Box mt={2}>
          <Typography variant="caption">User (username)</Typography>
          <TextField
            fullWidth size="small"
            placeholder="username..."
            value={local.user}
            onChange={(e) => setLocal((s) => ({ ...s, user: e.target.value }))}
          />
        </Box>

        {/* Dates */}
        <Box mt={2} display="flex" gap={1}>
          <TextField
            type="date"
            label="From"
            size="small"
            value={local.dateFrom}
            onChange={(e) => setLocal((s) => ({ ...s, dateFrom: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To"
            size="small"
            value={local.dateTo}
            onChange={(e) => setLocal((s) => ({ ...s, dateTo: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Buttons */}
        <Box display="flex" gap={2} mt={3}>
          <Button variant="contained" fullWidth onClick={apply}>Apply</Button>
          <Button variant="outlined" fullWidth onClick={clear}>Reset</Button>
        </Box>
      </Box>
    </Drawer>
  );
}
