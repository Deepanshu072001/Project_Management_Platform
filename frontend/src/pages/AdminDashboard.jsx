// src/pages/AdminDashboard.jsx
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
  MenuItem,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  TextField as MuiTextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllUsers } from "../api/users";
import { fetchProjects } from "../api/projects";
import { fetchTasks } from "../api/tasks";
import * as adminApi from "../api/admin";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ROLE_OPTIONS = ["member", "project_admin", "admin"];

/* CSV EXPORT HELPER */
function csvDownload(filename, rows) {
  if (!rows || !rows.length) return;

  const header = Object.keys(rows[0]);
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      header.map((h) => String(r[h] ?? "").replace(/"/g, '""')).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function AdminDashboard() {
  const qc = useQueryClient();

  /* FETCH USERS & PROJECTS */
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAllUsers,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: fetchProjects,
  });

  /* SAFE USER EXTRACTION */
  const users = useMemo(() => {
    const raw = usersData?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.users)) return raw.users;
    return [];
  }, [usersData]);

  const projects = useMemo(() => {
    const raw = projectsData?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.projects)) return raw.projects;
    return [];
  }, [projectsData]);

  /* LOAD ALL TASKS */
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      let all = [];
      for (const p of projects) {
        try {
          const res = await fetchTasks(p._id);
          all = all.concat(res?.data?.data || []);
        } catch {}
      }
      if (!cancelled) setAllTasks(all);
    }

    if (projects.length) loadTasks();
    else setAllTasks([]);

    return () => (cancelled = true);
  }, [projects]);

  /* DERIVED ANALYTICS */
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      completed: allTasks.filter((t) => t.status === "done").length,
    };
  }, [users, projects, allTasks]);

  const tasksPerProject = useMemo(() => {
    return projects.map((p) => {
      const tasks = allTasks.filter((t) => t.projectId === p._id);
      return {
        name: p.name,
        tasks: tasks.length,
        completed: tasks.filter((t) => t.status === "done").length,
      };
    });
  }, [projects, allTasks]);

  /* SNACKBAR */
  const [snack, setSnack] = useState(null);
  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });

  /* MUTATIONS */
  const banMut = useMutation({
    mutationFn: ({ userId, ban }) => adminApi.banUser(userId, ban),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "users"]);
      showSnack("User ban status updated");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "users"]);
      showSnack("User deleted");
    },
  });

  const changeRoleMut = useMutation({
    mutationFn: ({ userId, role }) => adminApi.changeUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "users"]);
      showSnack("Role updated");
    },
  });

  const transferProjectMut = useMutation({
    mutationFn: ({ projectId, newOwnerId }) =>
      adminApi.transferProject(projectId, newOwnerId),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "projects"]);
      showSnack("Project ownership transferred");
    },
  });

  /* UI STATE */
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    user: null,
  });

  const [transferDialog, setTransferDialog] = useState({
    open: false,
    project: null,
    newOwnerId: "",
  });

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const [activityLogs, setActivityLogs] = useState([
    { id: 1, ts: new Date().toISOString(), level: "info", message: "Admin panel opened" },
  ]);

  /* CONFIRM */
  function handleOpenConfirm(action, user) {
    setConfirmDialog({ open: true, action, user });
  }
  function handleCloseConfirm() {
    setConfirmDialog({ open: false, action: null, user: null });
  }

  async function handleConfirmAction() {
    const { action, user } = confirmDialog;

    if (action === "ban")
      await banMut.mutateAsync({ userId: user._id, ban: !user.banned });

    if (action === "delete")
      await deleteMut.mutateAsync(user._id);

    handleCloseConfirm();
  }

  /* TRANSFER */
  function openTransferDialog(project) {
    setTransferDialog({ open: true, project, newOwnerId: "" });
  }
  const closeTransferDialog = () =>
    setTransferDialog({ open: false, project: null, newOwnerId: "" });

  async function doTransfer() {
    const { project, newOwnerId } = transferDialog;
    if (!newOwnerId) return showSnack("Select a new owner", "warning");

    await transferProjectMut.mutateAsync({
      projectId: project._id,
      newOwnerId,
    });

    closeTransferDialog();
  }

  /* FILTER USERS */
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();

    return users.filter((u) => {
      if (userFilter !== "all") {
        if (userFilter === "banned" && !u.banned) return false;
        if (userFilter !== "banned" && u.role !== userFilter) return false;
      }

      return (
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    });
  }, [users, search, userFilter]);

  /* EXPORT HELPERS */
  function exportUsersCSV() {
    csvDownload(
      "users.csv",
      users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
        banned: u.banned,
      }))
    );
  }

  function exportProjectsCSV() {
    csvDownload(
      "projects.csv",
      projects.map((p) => ({
        id: p._id,
        name: p.name,
        membersCount: p.members?.length || 0,
        owner: p.owner?.username || "",
      }))
    );
  }

  /* UI */
  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      <Box mt={4} mb={2} display="flex" justifyContent="space-between">
        <Typography variant="h4">
          Admin Dashboard — System & User Management
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={exportUsersCSV}>
            Export Users
          </Button>
          <Button variant="outlined" onClick={exportProjectsCSV}>
            Export Projects
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>

        {/* SUMMARY CARDS */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Users</Typography>
            <Typography variant="h3" color="primary">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Projects</Typography>
            <Typography variant="h3" color="primary">{stats.totalProjects}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Tasks</Typography>
            <Typography variant="h3" color="primary">{stats.totalTasks}</Typography>
            <Typography variant="caption">{stats.completed} completed</Typography>
          </Paper>
        </Grid>

        {/* ACTIVITY LOGS CARD */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Activity Logs</Typography>
            <Typography variant="body2">
              Recent: {activityLogs.slice(-1)[0]?.message}
            </Typography>
          </Paper>
        </Grid>

        {/* USERS LIST */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 520, overflow: "auto" }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Users</Typography>

              <Box display="flex" gap={1}>
                <MuiTextField
                  size="small"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <MuiTextField
                  size="small"
                  select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="project_admin">Project Admin</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="banned">Banned</MenuItem>
                </MuiTextField>
              </Box>
            </Box>

            {usersLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredUsers.map((u) => (
                  <React.Fragment key={u._id}>
                    <ListItem
                      secondaryAction={
                        <Box display="flex" gap={1}>
                          <MuiTextField
                            select
                            size="small"
                            sx={{ width: 140 }}
                            value={u.role}
                            onChange={(e) =>
                              changeRoleMut.mutate({
                                userId: u._id,
                                role: e.target.value,
                              })
                            }
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                          </MuiTextField>

                          <Tooltip title={u.banned ? "Unban" : "Ban"}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenConfirm("ban", u)}
                            >
                              {u.banned ? "Unban" : "Ban"}
                            </Button>
                          </Tooltip>

                          <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => handleOpenConfirm("delete", u)}
                          >
                            Delete
                          </Button>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={u.avatar?.url}>
                          {u.username?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={`${u.username}${u.role === "admin" ? " (Admin)" : ""}`}
                        secondary={u.email}
                      />
                    </ListItem>

                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* PROJECTS LIST */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 520, overflow: "auto" }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Projects</Typography>
              <Typography variant="caption">{projects.length} total</Typography>
            </Box>

            <List>
              {projects.map((p) => (
                <React.Fragment key={p._id}>
                  <ListItem
                    secondaryAction={
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="outlined" onClick={() => openTransferDialog(p)}>
                          Transfer
                        </Button>

                        <Button size="small" variant="contained" onClick={() => alert("Project management TODO")}>
                          Manage
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={p.name}
                      secondary={`Members: ${p.members?.length || 0} • Owner: ${p.owner?.username || "—"}`}
                    />
                  </ListItem>

                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* TASKS CHART */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tasks per Project</Typography>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tasksPerProject}>
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#1976d2" />
                <Bar dataKey="completed" fill="#43a047" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ACTIVITY LOGS PANEL */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Activity Logs</Typography>

            <List>
              {activityLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText
                      primary={log.message}
                      secondary={`${log.level} • ${new Date(log.ts).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box mt={2} display="flex" gap={1}>

              {/* ⭐ ADDED LOG BUTTON (YOUR REQUEST) */}
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const next = {
                    id: Date.now(),
                    ts: new Date().toISOString(),
                    level: "info",
                    message: "Manual log created",
                  };
                  setActivityLogs((prev) => [...prev, next]);
                }}
              >
                Add Log
              </Button>

              <Button
                size="small"
                variant="contained"
                onClick={() =>
                  csvDownload(
                    "activity_logs.csv",
                    activityLogs.map((l) => ({
                      id: l.id,
                      ts: l.ts,
                      level: l.level,
                      message: l.message,
                    }))
                  )
                }
              >
                Export Logs
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* CONFIRM DIALOG */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm {confirmDialog.action}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} user{" "}
            <strong>{confirmDialog.user?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmAction}>
            Yes, {confirmDialog.action}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TRANSFER OWNERSHIP DIALOG */}
      <Dialog open={transferDialog.open} onClose={closeTransferDialog} fullWidth maxWidth="sm">
        <DialogTitle>Transfer Project Ownership</DialogTitle>
        <DialogContent>
          <Typography mb={1}>
            Project: <strong>{transferDialog.project?.name}</strong>
          </Typography>

          <MuiTextField
            select
            fullWidth
            value={transferDialog.newOwnerId}
            label="New Owner"
            onChange={(e) =>
              setTransferDialog((d) => ({
                ...d,
                newOwnerId: e.target.value,
              }))
            }
          >
            <MenuItem value="">Select user</MenuItem>
            {users.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.username} ({u.email})
              </MenuItem>
            ))}
          </MuiTextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeTransferDialog}>Cancel</Button>
          <Button variant="contained" disabled={!transferDialog.newOwnerId} onClick={doTransfer}>
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
      >
        {snack ? <Alert severity={snack.severity}>{snack.msg}</Alert> : null}
      </Snackbar>
    </Container>
  );
}
