// src/pages/ProjectDetails.jsx
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Tabs, Tab } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectDetails } from "../api/projects";
import KanbanBoard from "../components/KanbanBoard";
import MembersPanel from "./Members";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const openColumnQuery = searchParams.get("openColumn") || null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectDetails(projectId),
  });

  const project = data?.data?.data;

  const [tab, setTab] = useState(0);
  const [initialOpenColumn, setInitialOpenColumn] = useState(null);

  useEffect(() => {
    if (openColumnQuery) {
      // store initial requested open column, pass to Kanban
      setInitialOpenColumn(openColumnQuery);
      // optionally switch to Board tab if not selected
      setTab(0);
    }
  }, [openColumnQuery]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load project</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
        <Typography variant="h5">{project.name}</Typography>
        <Typography variant="body2">Members: {project.members.length}</Typography>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Board" />
        <Tab label="Members" />
      </Tabs>

      <Box mt={2}>
        {tab === 0 && <KanbanBoard projectId={projectId} initialOpenColumn={initialOpenColumn} />}
        {tab === 1 && <MembersPanel projectId={projectId} />}
      </Box>
    </Container>
  );
}
