// src/pages/Profile.jsx
import React, { useState } from "react";
import { Container, Stack } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";
import axios from "../api/axiosInstance";
import AvatarUpload from "../components/AvatarUpload";
import PrimaryButton from "../components/PrimaryButton";

export default function Profile() {
  const qc = useQueryClient();

  // ✅ React Query v5 syntax
  const { data, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const user = data?.data?.data;

  const [preview, setPreview] = useState(user?.avatar?.url);
  const [file, setFile] = useState(null);

  const chooseFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upload = async () => {
    if (!file) {
      alert("Please choose an avatar first");
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);

    await axios.put("/users/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Refresh user data
    qc.invalidateQueries({ queryKey: ["currentUser"] });
    alert("Avatar updated!");
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (isError) return <div>Unable to load profile</div>;

  return (
    <Container maxWidth="sm">
      <Stack spacing={3} mt={6}>
        <AvatarUpload preview={preview} onFileChange={chooseFile} />
        <PrimaryButton onClick={upload}>Update Avatar</PrimaryButton>
      </Stack>
    </Container>
  );
}
