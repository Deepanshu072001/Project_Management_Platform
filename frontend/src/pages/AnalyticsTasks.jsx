// src/pages/AnalyticsTasks.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Container, Typography, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, Button, Box
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../api/projects";
import { fetchTasks } from "../api/tasks";

function paramsToFilters(searchParams) {
  return {
    projectIds: searchParams.get("projects")?.split(",") || [],
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    user: searchParams.get("user") || "",
    dateFrom: searchParams.get("from") || "",
    dateTo: searchParams.get("to") || "",
  };
}

export default function AnalyticsTasks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // ✅ FIX — Memoize projects so dependency is stable
  const projects = useMemo(() => projectsData?.data?.data || [], [projectsData]);

  const [tasksByProject, setTasksByProject] = useState([]);

  useEffect(() => {
    if (!projects.length) {
      setTasksByProject([]);
      return;
    }

    let cancelled = false;

    (async () => {
      const all = [];
      for (const p of projects) {
        const resp = await fetchTasks(p._id);
        all.push({
          projectId: p._id,
          projectName: p.name,
          tasks: resp?.data?.data || [],
        });
      }
      if (!cancelled) setTasksByProject(all);
    })();

    return () => (cancelled = true);
  }, [projects]); // SAFE NOW ✔

  const allTasks = useMemo(
    () =>
      tasksByProject.flatMap((p) =>
        (p.tasks || []).map((t) => ({
          ...t,
          projectName: p.projectName,
          projectId: p.projectId,
        }))
      ),
    [tasksByProject]
  );

  const filtered = useMemo(() => {
    return allTasks.filter((t) => {
      if (filters.projectIds.length && !filters.projectIds.includes(t.projectId))
        return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && (t.priority || "medium") !== filters.priority)
        return false;
      if (
        filters.user &&
        !String(t.createdBy?.username || t.createdBy?.email || t.createdBy?._id)
          .toLowerCase()
          .includes(filters.user.toLowerCase())
      )
        return false;
      if (filters.dateFrom && t.createdAt?.slice(0, 10) < filters.dateFrom)
        return false;
      if (filters.dateTo && t.createdAt?.slice(0, 10) > filters.dateTo)
        return false;
      return true;
    });
  }, [allTasks, filters]);

  const openInKanban = (projectId, status) => {
    navigate(`/projects/${projectId}?openColumn=${status}`);
  };

  return (
        
    <Container>
      <Box display="flex" justifyContent="space-between" mt={3} mb={2}>
        <Typography variant="h5">Filtered Tasks</Typography>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography mb={2} variant="subtitle2">
          Showing {filtered.length} tasks
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.projectName}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell>{t.priority || "medium"}</TableCell>
                <TableCell>{t.createdAt?.slice(0, 10)}</TableCell>
                <TableCell>
                  <Button onClick={() => navigate(`/projects/${t.projectId}`)}>
                    Open Project
                  </Button>
                  <Button 
                    sx={{ ml: 1 }}
                    onClick={() => openInKanban(t.projectId, t.status)}
                  >
                    Open in Kanban
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>

    
  );
}
