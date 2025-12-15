// src/pages/Projects.jsx
import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PrimaryButton from "../components/PrimaryButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject } from "../api/projects";
import { Link as RouterLink } from "react-router-dom";

export default function Projects() {
  const qc = useQueryClient();

  // ✅ React Query v5 syntax
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    retry: false,
  });

  const projects = data?.data?.data || [];

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // ✅ React Query v5 mutation syntax
  const createMut = useMutation({
    mutationFn: (payload) => createProject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      setDesc("");
    },
  });

  if (isLoading) return <div>Loading projects...</div>;
  if (isError) return <div>Failed to load projects</div>;

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={3}>
        <Typography variant="h5">Projects</Typography>
        <PrimaryButton onClick={() => setOpen(true)}>Create Project</PrimaryButton>
      </Box>

      <Grid container spacing={2}>
        {projects.map((p) => (
          <Grid key={p._id} item xs={12} sm={6} md={4}>
            <Card
              component={RouterLink}
              to={`/projects/${p._id}`}
              sx={{ textDecoration: "none" }}
            >
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {p.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Members: {p.members?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Project Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <PrimaryButton onClick={() => setOpen(false)} sx={{ mr: 1 }}>
            Cancel
          </PrimaryButton>
          <PrimaryButton
            onClick={() => createMut.mutate({ name, description: desc })}
            disabled={!name || createMut.isLoading}
          >
            Create
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
