// src/pages/NotesPage.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../api/notes";

export default function NotesPage() {
  const { projectId } = useParams();
  const qc = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editNote, setEditNote] = useState(null);

  // Fetch notes
  const { data, isLoading } = useQuery({
    queryKey: ["notes", projectId],
    queryFn: () => fetchNotes(projectId),
  });

  const notes = data?.data?.data || [];

  // Create note
  const createMut = useMutation({
    mutationFn: (payload) => createNote(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries(["notes", projectId]);
      setOpenCreate(false);
      setTitle("");
      setContent("");
    },
  });

  // Update note
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateNote(projectId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries(["notes", projectId]);
      setOpenEdit(false);
    },
  });

  // Delete note
  const deleteMut = useMutation({
    mutationFn: (id) => deleteNote(projectId, id),
    onSuccess: () => qc.invalidateQueries(["notes", projectId]),
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createMut.mutate({ title, content });
  };

  const openEditModal = (note) => {
    setEditNote(note);
    setTitle(note.title);
    setContent(note.content);
    setOpenEdit(true);
  };

  const handleUpdate = () => {
    updateMut.mutate({
      id: editNote._id,
      payload: { title, content },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={600}>
            Notes
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Add Note
          </Button>
        </Box>

        <Box mt={3}>
          {isLoading ? (
            <Typography>Loading notes...</Typography>
          ) : notes.length === 0 ? (
            <Typography>No notes found.</Typography>
          ) : (
            <List>
              {notes.map((note) => (
                <ListItem
                  key={note._id}
                  sx={{ borderBottom: "1px solid #eee" }}
                >
                  <ListItemText
                    primary={note.title}
                    secondary={note.content}
                  />

                  <ListItemSecondaryAction>
                    <IconButton sx={{ mr: 1 }} onClick={() => openEditModal(note)}>
                      <EditIcon color="info" />
                    </IconButton>

                    <IconButton onClick={() => deleteMut.mutate(note._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Create Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth>
        <DialogTitle>Create Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            sx={{ mt: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={4}
            sx={{ mt: 2 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            sx={{ mt: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={4}
            sx={{ mt: 2 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
