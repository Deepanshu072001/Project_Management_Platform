// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";
import { fetchProjects } from "../api/projects";
import { fetchTasks } from "../api/tasks";

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  // Fetch User
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const user = userData?.data?.data;

  // Fetch Projects
  const { data: projectData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Memoized Projects (stable dependency)
  const projects = useMemo(() => {
    return projectData?.data?.data || [];
  }, [projectData]);

  // Fetch All Tasks for all Projects
  const { data: allTasksData } = useQuery({
    queryKey: ["tasks-all"],
    queryFn: async () => {
      let all = [];
      for (const project of projects) {
        const res = await fetchTasks(project._id);
        all = [...all, ...(res.data?.data || [])];
      }
      return all;
    },
    enabled: projects.length > 0,
  });

  // Memoized Tasks
  const tasks = useMemo(() => {
    return allTasksData || [];
  }, [allTasksData]);

  // Task Status Summary
  const stats = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  // Chart Data - Task Breakdown
  const taskBreakdownChart = useMemo(() => {
    return [
      { name: "To Do", value: stats.todo },
      { name: "In Progress", value: stats.in_progress },
      { name: "Done", value: stats.done },
    ];
  }, [stats]);

  // Chart Data - Tasks per Project
  const tasksPerProject = useMemo(() => {
    return projects.map((project) => ({
      name: project.name,
      tasks: tasks.filter((t) => t.projectId === project._id).length,
    }));
  }, [projects, tasks]);

  // Recent Tasks
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  }, [tasks]);

  return (
    <Container>
      {/* Welcome Section */}
      <Typography variant="h4" mt={4} mb={2} fontWeight={600}>
        Welcome back, {user?.username} 👋
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Projects</Typography>
            <Typography variant="h3" color="primary">
              {projects.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Total Tasks</Typography>
            <Typography variant="h3" color="primary">
              {tasks.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Completed</Typography>
            <Typography variant="h3" color="primary">
              {stats.done}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} mt={2}>

        {/* Task Breakdown Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Task Breakdown</Typography>
              <Button size="small" onClick={() => (window.location.href = "/analytics")}>
                View Analytics
              </Button>
            </Box>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskBreakdownChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2962FF" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tasks per Project Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={1}>
              Tasks per Project
            </Typography>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tasksPerProject}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#00bfa5" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Tasks */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Recent Tasks
            </Typography>

            {recentTasks.length === 0 && (
              <Typography color="text.secondary">No recent tasks found.</Typography>
            )}

            <List>
              {recentTasks.map((task) => (
                <React.Fragment key={task._id}>
                  <ListItem>
                    <ListItemText
                      primary={task.title}
                      secondary={`Status: ${task.status}`}
                    />
                    <Button
                      size="small"
                      onClick={() =>
                        (window.location.href = `/projects/${task.projectId}`)
                      }
                    >
                      Open Project
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
