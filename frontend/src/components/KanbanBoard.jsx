// src/components/KanbanBoard.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  Button
} from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, updateTask, createTask } from "../api/tasks";

import TaskCard from "./TaskCard";
import TaskDrawer from "./TaskDrawer";

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function KanbanBoard({
  projectId,
  initialOpenColumn = null
}) {
  const qc = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Refs used for scrolling to a column
  const colRefs = useRef({});

  // LOAD TASKS
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchTasks(projectId),
  });

  const tasks = useMemo(() => {
    return data?.data?.data || [];
  }, [data]);

  // --- Mutations ---
  const updateMut = useMutation({
    mutationFn: ({ taskId, payload }) =>
      updateTask(projectId, taskId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  const createMut = useMutation({
    mutationFn: (payload) => createTask(projectId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  // GROUP TASKS (SAFE — useMemo)
  const grouped = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      done: tasks.filter((t) => t.status === "done"),
    };
  }, [tasks]);

  // DRAG HANDLER
  const onDragEnd = (res) => {
    if (!res.destination) return;

    const { draggableId, source, destination } = res;

    if (source.droppableId === destination.droppableId) return;

    updateMut.mutate({
      taskId: draggableId,
      payload: { status: destination.droppableId },
    });
  };

  // OPEN DRAWERS
  const openCreate = () => {
    setEditingTask(null);
    setDrawerOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setDrawerOpen(true);
  };

  // HANDLE NEW / UPDATE TASK SAVE
  //  const handleSave = (payload) => {
  //    if (editingTask) {
  //     updateMut.mutate({
  //       taskId: editingTask._id,
  //       payload,
  //     });
  //    } else {
  //     createMut.mutate(payload);
  //    }
  //   setDrawerOpen(false);
  //  };

  // SCROLL TO A COLUMN WHEN PROJECT DETAILS PAGE TELLS TO OPEN ONE
  useEffect(() => {
    if (initialOpenColumn && colRefs.current[initialOpenColumn]) {
      colRefs.current[initialOpenColumn].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [initialOpenColumn, tasks]);

  if (isLoading) return <div>Loading board...</div>;

  return (
    <>
      {/* CREATE TASK BUTTON */}
      <Button sx={{ mb: 2 }} variant="contained" onClick={openCreate}>
        Create Task
      </Button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {columns.map((col) => (
            <Grid
              item
              xs={12}
              md={4}
              key={col.id}
              ref={(el) => (colRefs.current[col.id] = el)}
            >
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <Typography variant="h6" mb={2}>
                  {col.title}
                </Typography>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: 300 }}
                    >
                      {grouped[col.id].map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(prov) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onDoubleClick={() => openEdit(task)}
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      {/* TASK DRAWER */}
      <TaskDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        task={editingTask}
        projectId={projectId}
        onCreateTask={(payload) => createMut.mutate(payload)}
        onUpdateTask={(id, payload) =>
          updateMut.mutate({ taskId: id, payload })
        }
      />
    </>
  );
}
