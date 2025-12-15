// src/components/AvatarUpload.jsx
import React from "react";
import { Avatar, Button, Stack } from "@mui/material";

export default function AvatarUpload({ preview, onFileChange }) {
  return (
    <Stack spacing={1} alignItems="center">
      <Avatar
        src={preview || undefined}
        sx={{ width: 90, height: 90, cursor: "pointer" }}
      />
      <Button variant="outlined" component="label">
        Upload Avatar
        <input hidden type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files[0])} />
      </Button>
    </Stack>
  );
}
