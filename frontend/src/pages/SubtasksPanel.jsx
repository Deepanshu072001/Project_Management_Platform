// src/pages/SubtasksPanel.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import PrimaryButton from "../components/PrimaryButton";

import {
  fetchSubtasks,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
} from "../api/subtasks";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SubtasksPanel({ projectId, taskId }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["subtasks", projectId, taskId],
    queryFn: () => fetchSubtasks(projectId, taskId),
  });

  const subtasks = data?.data?.data || [];

  const createMut = useMutation({
    mutationFn: (payload) => createSubtask(projectId, taskId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["subtasks", projectId, taskId] }),
  });

  const toggleMut = useMutation({
    mutationFn: (subtask) =>
      toggleSubtask(projectId, subtask._id, { completed: !subtask.completed }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["subtasks", projectId, taskId] }),
  });

  const deleteMut = useMutation({
    mutationFn: (subtaskId) => deleteSubtask(projectId, subtaskId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["subtasks", projectId, taskId] }),
  });

  if (isLoading) return <div>Loading subtasks...</div>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Subtasks</Typography>

      {/* Create Subtask */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Subtask Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <PrimaryButton onClick={() => createMut.mutate({ title })}>
          Add
        </PrimaryButton>
      </Box>

      {/* Table */}
      <Table>
        <TableBody>
          {subtasks.map((sub) => (
            <TableRow key={sub._id}>
              <TableCell>{sub.title}</TableCell>
              <TableCell>
                <PrimaryButton size="small" onClick={() => toggleMut.mutate(sub)}>
                  {sub.completed ? "Undo" : "Complete"}
                </PrimaryButton>
              </TableCell>
              <TableCell>
                <PrimaryButton
                  size="small"
                  sx={{ color: "red" }}
                  onClick={() => deleteMut.mutate(sub._id)}
                >
                  Delete
                </PrimaryButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
