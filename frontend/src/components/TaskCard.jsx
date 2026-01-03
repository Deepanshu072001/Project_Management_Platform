// src/components/TaskCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";

export default function TaskCard({ task, onOpen }) {
  return (
    <Card sx={{ mb: 2, borderRadius: 2, cursor: "pointer" }} onClick={() => onOpen && onOpen(task)}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {task.description?.slice(0, 100)}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="caption">Status: {task.status}</Typography>
          {task.assignedTo ? (
            <Avatar sx={{ width: 28, height: 28 }} src={task.assignedTo?.avatar?.url} />
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}
