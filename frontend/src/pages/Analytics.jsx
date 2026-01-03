// src/pages/Analytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../api/projects";
import { fetchTasks } from "../api/tasks";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = {
  todo: "#ffb74d",
  in_progress: "#29b6f6",
  done: "#66bb6a",
  high: "#ff7043",
  medium: "#ffa726",
  low: "#90a4ae",
};

function StatPaper({ children, sx }) {
  return (
    <Paper sx={{ p: 2, height: "100%", borderRadius: 2, boxShadow: 3, ...sx }}>
      {children}
    </Paper>
  );
}

export default function Analytics() {
  const navigate = useNavigate();

  // -------------------------
  // LOAD PROJECTS
  // -------------------------
  const { data: projectsData, isLoading: projLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Safe memoized project list
  const projects = useMemo(() => projectsData?.data?.data || [], [projectsData]);

  // -------------------------
  // LOAD TASKS FOR ALL PROJECTS
  // -------------------------
  const [tasksByProject, setTasksByProject] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const result = [];

      for (const p of projects) {
        try {
          const res = await fetchTasks(p._id);
          result.push({
            projectId: p._id,
            projectName: p.name,
            tasks: res?.data?.data || [],
          });
        } catch {
          result.push({
            projectId: p._id,
            projectName: p.name,
            tasks: [],
          });
        }
      }

      if (!cancelled) setTasksByProject(result);
    }

    if (projects.length > 0) loadAll();

    return () => (cancelled = true);
  }, [projects]);

  // -------------------------
  // FLATTEN TASKS
  // -------------------------
  const allTasks = useMemo(
    () =>
      tasksByProject.flatMap((p) =>
        p.tasks.map((t) => ({
          ...t,
          projectId: p.projectId,
          projectName: p.projectName,
        }))
      ),
    [tasksByProject]
  );

  // -------------------------
  // STATUS DISTRIBUTION
  // -------------------------
  const statusCounts = useMemo(() => {
    const map = { todo: 0, in_progress: 0, done: 0 };
    allTasks.forEach((t) => map[t.status]++);
    return [
      { name: "To Do", key: "todo", value: map.todo },
      { name: "In Progress", key: "in_progress", value: map.in_progress },
      { name: "Done", key: "done", value: map.done },
    ];
  }, [allTasks]);

  // -------------------------
  // PRIORITY DISTRIBUTION (FIX APPLIED)
  // -------------------------
  const priorityData = useMemo(() => {
    const map = { high: 0, medium: 0, low: 0 };
    allTasks.forEach((t) => {
      const pr = t.priority || "medium"; // ⭐ fix undefined
      map[pr]++;
    });
    return Object.entries(map).map(([name, value]) => ({ name, key: name, value }));
  }, [allTasks]);

  const totalPriority = useMemo(
    () => priorityData.reduce((s, v) => s + v.value, 0),
    [priorityData]
  );

  // -------------------------
  // TASKS PER PROJECT
  // -------------------------
  const tasksPerProject = useMemo(
    () =>
      tasksByProject.map((p) => ({
        name: p.projectName,
        tasks: p.tasks.length,
        completed: p.tasks.filter((t) => t.status === "done").length,
      })),
    [tasksByProject]
  );

  // -------------------------
  // MONTHLY ACTIVITY
  // -------------------------
  const monthlyActivity = useMemo(() => {
    const output = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      output.push({
        key,
        label: d.toLocaleString("default", { month: "short" }),
        created: 0,
      });
    }

    allTasks.forEach((t) => {
      const month = t.createdAt?.slice(0, 7);
      const bucket = output.find((b) => b.key === month);
      if (bucket) bucket.created++;
    });

    return output;
  }, [allTasks]);

  // -------------------------
  // LEADERBOARD
  // -------------------------
  const leaderboard = useMemo(() => {
    const map = {};

    allTasks.forEach((t) => {
      const name =
        t.createdBy?.username ||
        t.createdBy?.email ||
        t.createdBy?._id ||
        "Unknown";

      if (!map[name]) {
        map[name] = {
          name,
          count: 0,
          avatar: t.createdBy?.avatar?.url || null,
        };
      }

      map[name].count++;
    });

    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [allTasks]);

  // -------------------------
  // NOW WE CAN RETURN UI SAFELY
  // -------------------------

  if (projLoading) {
    return (
      <Container>
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" mt={4} mb={2}>
        <Typography variant="h4" fontWeight={700}>
          Analytics
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <Grid container spacing={3}>

        {/* KPI CARDS */}
        <Grid item xs={12} md={4}>
          <StatPaper>
            <Typography>Total Projects</Typography>
            <Typography variant="h4">{projects.length}</Typography>
          </StatPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatPaper>
            <Typography>Total Tasks</Typography>
            <Typography variant="h4">{allTasks.length}</Typography>
          </StatPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatPaper>
            <Typography>Completed</Typography>
            <Typography variant="h4">
              {allTasks.filter((t) => t.status === "done").length}
            </Typography>
          </StatPaper>
        </Grid>

        {/* STATUS PIE CHART */}
        <Grid item xs={12} md={5}>
          <StatPaper sx={{ height: 420 }}>
            <Typography variant="h6">Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  label
                >
                  {statusCounts.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </StatPaper>
        </Grid>

        {/* PRIORITY DONUT */}
        <Grid item xs={12} md={4}>
          <StatPaper sx={{ height: 420 }}>
            <Typography variant="h6">Priority Breakdown</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={priorityData}
                  innerRadius={50}
                  outerRadius={100}
                  dataKey="value"
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <Box textAlign="center" mt={-10}>
              <Typography variant="h4">{totalPriority}</Typography>
              <Typography variant="caption">Total Tasks</Typography>
            </Box>
          </StatPaper>
        </Grid>

        {/* LEADERBOARD */}
        <Grid item xs={12} md={3}>
          <StatPaper sx={{ height: 420 }}>
            <Typography variant="h6">Team Leaderboard</Typography>

            <List sx={{ maxHeight: 330, overflowY: "auto" }}>
              {leaderboard.map((m, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={m.avatar || undefined}>
                        {m.name[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${idx + 1}. ${m.name}`}
                      secondary={`${m.count} tasks`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </StatPaper>
        </Grid>

        {/* BAR CHART */}
        <Grid item xs={12} md={7}>
          <StatPaper sx={{ height: 420 }}>
            <Typography variant="h6">Tasks per Project</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={tasksPerProject}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#42a5f5" />
                <Bar dataKey="completed" fill="#66bb6a" />
              </BarChart>
            </ResponsiveContainer>
          </StatPaper>
        </Grid>

        {/* AREA CHART */}
        <Grid item xs={12} md={5}>
          <StatPaper sx={{ height: 420 }}>
            <Typography variant="h6">Monthly Activity</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area
                  dataKey="created"
                  stroke="#2979ff"
                  fill="#2979ff33"
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </StatPaper>
        </Grid>
      </Grid>
    </Container>
  );
}
