// src/components/TaskDrawer.jsx
import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  TextField,
  Typography,
  Stack,
  IconButton,
  Divider,
  Button,
  MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  fetchSubtasks,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
} from "../api/subtasks";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function TaskDrawer({
  open,
  onClose,
  task,
  projectId,
  onCreateTask,
  onUpdateTask,
}) {
  const qc = useQueryClient();

  // TASK FORM STATE
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status || "todo");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
    }
  }, [task]);

  // SUBTASKS
  const [subtaskTitle, setSubtaskTitle] = useState("");

  const enabledForSubtasks = Boolean(task && projectId && task._id);

  const { data: subtaskData } = useQuery({
    queryKey: ["subtasks", projectId, task?._id],
    queryFn: () => fetchSubtasks(projectId, task._id),
    enabled: enabledForSubtasks,
  });

  // backend returns list under .data?.data (ApiResponse wrapper)
  const subtasks = subtaskData?.data?.data || [];

  // mutations
  const createSub = useMutation({
    mutationFn: (payload) => createSubtask(projectId, task._id, payload),
    onSuccess: () => {
      qc.invalidateQueries(["subtasks", projectId, task._id]);
      setSubtaskTitle("");
    },
  });

  const toggleSub = useMutation({
    mutationFn: ({ subtaskId, payload }) =>
      toggleSubtask(projectId, subtaskId, payload),
    onSuccess: () =>
      qc.invalidateQueries(["subtasks", projectId, task._id]),
  });

  const deleteSub = useMutation({
    mutationFn: (id) => deleteSubtask(projectId, id),
    onSuccess: () =>
      qc.invalidateQueries(["subtasks", projectId, task._id]),
  });

  const handleAddSubtask = () => {
    if (!subtaskTitle.trim()) return alert("Enter a subtask title");
    createSub.mutate({ title: subtaskTitle.trim() });
  };

  const handleToggle = (sub) => {
    // IMPORTANT: backend expects { isCompleted: boolean }
    const payload = { isCompleted: !Boolean(sub.isCompleted) };
    toggleSub.mutate({ subtaskId: sub._id, payload });
  };

  const handleDelete = (subId) => {
    if (!window.confirm("Delete this subtask?")) return;
    deleteSub.mutate(subId);
  };

  const handleSaveTask = () => {
    if (!title.trim()) return alert("Task title is required");

    const payload = { title, description, status };

    if (task) {
      onUpdateTask(task._id, payload);
    } else {
      onCreateTask(payload);
    }

    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">
            {task ? "Edit Task" : "Create Task"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label="Status"
            select
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>

          <Button variant="contained" onClick={handleSaveTask}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </Stack>

        {task && (
          <>
            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1">Subtasks</Typography>

            <Stack direction="row" spacing={1} mt={1}>
              <TextField
                fullWidth
                size="small"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
              />
              <Button variant="contained" onClick={handleAddSubtask}>
                Add
              </Button>
            </Stack>

            <Box mt={2}>
              {subtasks.map((sub) => (
                <Box
                  key={sub._id}
                  sx={{
                    p: 1,
                    my: 1,
                    borderRadius: 1,
                    border: "1px solid #ccc",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ textDecoration: sub.isCompleted ? "line-through" : "none" }}>
                      {sub.title}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => handleToggle(sub)}>
                        {sub.isCompleted ? "Undo" : "Done"}
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(sub._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
