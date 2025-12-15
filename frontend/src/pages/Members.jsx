// src/pages/Members.jsx
import React, { useState } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
} from "@mui/material";
import PrimaryButton from "../components/PrimaryButton";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from "../api/members";

export default function MembersPanel({ projectId }) {
  const qc = useQueryClient();

  // ------------------------------------------------------------
  // ✅ React Query v5 useQuery with "select" for safe array output
  // ------------------------------------------------------------
  const {
    data: members = [],   // fallback: always array
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => fetchMembers(projectId),
    retry: false,

    // 🔥 ALWAYS return an array — prevents ".map is not a function"
    select: (res) => {
      const arr = res?.data?.data;
      return Array.isArray(arr) ? arr : [];
    },
  });

  // ------------------------------------------------------------
  // Local state for adding members
  // ------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  // ------------------------------------------------------------
  // Mutations (add, update, delete)
  // ------------------------------------------------------------
  const addMut = useMutation({
    mutationFn: (payload) => addMember(projectId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["members", projectId] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ userId, payload }) =>
      updateMemberRole(projectId, userId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["members", projectId] }),
  });

  const removeMut = useMutation({
    mutationFn: (userId) => removeMember(projectId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["members", projectId] }),
  });

  // ------------------------------------------------------------
  // UI states
  // ------------------------------------------------------------
  if (isLoading) return <div>Loading members...</div>;
  if (error) return <div>Error loading members</div>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Members
      </Typography>

      {/* Add Member Form */}
      <Box display="flex" gap={2} sx={{ mb: 2 }}>
        <TextField
          label="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          helperText="admin | project_admin | member"
        />

        <PrimaryButton
          onClick={() => addMut.mutate({ email, role })}
        >
          Add
        </PrimaryButton>
      </Box>

      {/* Members Table */}
      <Table>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m._id}>
              <TableCell>
                {m.user.username} ({m.user.email})
              </TableCell>

              <TableCell>{m.role}</TableCell>

              <TableCell>
                <PrimaryButton
                  size="small"
                  onClick={() =>
                    updateMut.mutate({
                      userId: m.user._id,
                      payload: {
                        role:
                          m.role === "member"
                            ? "project_admin"
                            : "member",
                      },
                    })
                  }
                >
                  Toggle Role
                </PrimaryButton>

                <PrimaryButton
                  size="small"
                  sx={{ ml: 1 }}
                  onClick={() => removeMut.mutate(m.user._id)}
                >
                  Remove
                </PrimaryButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
