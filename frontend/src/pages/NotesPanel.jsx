// src/pages/NotesPanel.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { fetchNotes, createNote, updateNote, deleteNote } from "../api/notes";
import { getCurrentUser } from "../api/auth";

export default function NotesPanel({ projectId }) {
  const qc = useQueryClient();

  // --------------------------
  // Get current user for admin
  // --------------------------
  const { data: userResp } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    select: (res) => res?.data?.data,
  });

  const isAdmin = userResp?.role === "admin";

  // --------------------------
  // Fetch notes list
  // --------------------------
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", projectId],
    queryFn: () => fetchNotes(projectId),
    retry: false,
    select: (res) => {
      // Backend returns: { statusCode, data: [], message }
      if (Array.isArray(res?.data?.data)) return res.data.data;
      return [];
    },
  });

  // --------------------------
  // Dialog states
  // --------------------------
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setOpen(true);
  };

  const openEdit = (note) => {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
    setOpen(true);
  };

  // --------------------------
  // Mutations
  // --------------------------
  const createMut = useMutation({
    mutationFn: (payload) => createNote(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", projectId] });
      setOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ noteId, payload }) =>
      updateNote(projectId, noteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", projectId] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (noteId) => deleteNote(projectId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", projectId] }),
  });

  const handleSubmit = () => {
    if (editing) {
      updateMut.mutate({ noteId: editing._id, payload: { title, content } });
    } else {
      createMut.mutate({ title, content });
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this note?")) return;
    deleteMut.mutate(id);
  };

  // --------------------------
  // JSX
  // --------------------------
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Notes</Typography>
        {isAdmin && (
          <Button variant="contained" onClick={openCreate}>Create Note</Button>
        )}
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow><TableCell>Loading...</TableCell></TableRow>
          ) : (
            notes.map((n) => (
              <TableRow key={n._id}>
                <TableCell>{n.title}</TableCell>

                <TableCell>
                  {n.createdBy?.username || "Unknown"}
                </TableCell>

                <TableCell>
                  <Button size="small" onClick={() => openEdit(n)}>
                    View / Edit
                  </Button>

                  {isAdmin && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(n._id)}
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Dialog for Create or Edit */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editing ? "Edit Note" : "Create Note"}
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            label="Content"
            fullWidth
            multiline
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
